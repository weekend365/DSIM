import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { ApiResponse, JwtPayload } from '@dsim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter } from 'events';
import { fromEvent, map, type Observable } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  private roomEmitters = new Map<string, EventEmitter>();

  private getEmitter(roomId: string): EventEmitter {
    if (!this.roomEmitters.has(roomId)) {
      this.roomEmitters.set(roomId, new EventEmitter());
    }
    return this.roomEmitters.get(roomId)!;
  }

  getMessage(): ApiResponse {
    return { message: 'Chat module ready' };
  }

  async createRoom(user: JwtPayload, dto: CreateChatRoomDto) {
    const participantList = dto.participantIds ?? [];
    const memberIds = Array.from(new Set([user.sub, ...participantList]));
    const existingUsers = await this.prisma.user.findMany({ where: { id: { in: memberIds } }, select: { id: true } });
    const existingIds = new Set(existingUsers.map((u) => u.id));
    const missing = memberIds.filter((id) => !existingIds.has(id));
    if (missing.length) {
      throw new BadRequestException(`존재하지 않는 사용자 ID: ${missing.join(', ')}`);
    }

    return this.prisma.chatRoom.create({
      data: {
        title: dto.title,
        members: {
          create: Array.from(existingIds).map((id) => ({ userId: id }))
        }
      },
      include: { members: true }
    });
  }

  async listRooms(user: JwtPayload) {
    return this.prisma.chatRoom.findMany({
      where: { members: { some: { userId: user.sub } } },
      include: { members: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async listMessages(user: JwtPayload, roomId: string) {
    const isMember = await this.prisma.chatMember.findFirst({ where: { roomId, userId: user.sub } });
    if (!isMember) throw new ForbiddenException('Not a member of this room');
    return this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, email: true, profile: { select: { avatarUrl: true } } } } }
    });
  }

  async sendMessage(user: JwtPayload, roomId: string, dto: SendMessageDto) {
    const isMember = await this.prisma.chatMember.findFirst({ where: { roomId, userId: user.sub } });
    if (!isMember) throw new ForbiddenException('Not a member of this room');
    const message = await this.prisma.chatMessage.create({
      data: { roomId, senderId: user.sub, content: dto.content },
      include: { sender: { select: { id: true, email: true, name: true, profile: { select: { avatarUrl: true } } } } }
    });
    this.getEmitter(roomId).emit('message', message);
    return message;
  }

  streamMessages(user: JwtPayload, roomId: string): Observable<{ data: unknown }> {
    return fromEvent(this.getEmitter(roomId), 'message').pipe(map((payload) => ({ data: payload })));
  }

  async invite(user: JwtPayload, roomId: string, dto: CreateInvitationDto) {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    const isMember = await this.prisma.chatMember.findFirst({ where: { roomId, userId: user.sub } });
    if (!isMember) throw new ForbiddenException('Not a member of this room');

    const invitee = await this.prisma.user.findUnique({ where: { id: dto.toUserId } });
    if (!invitee) throw new BadRequestException('존재하지 않는 사용자입니다');

    const invitation = await this.prisma.chatInvitation.create({
      data: {
        roomId,
        fromUserId: user.sub,
        toUserId: dto.toUserId
      }
    });

    await this.notifications.createForUser(dto.toUserId, {
      type: 'chat_invite',
      title: '채팅 초대',
      message: `${user.email}님이 채팅방에 초대했습니다`
    });

    return invitation;
  }

  async listInvitations(user: JwtPayload) {
    return this.prisma.chatInvitation.findMany({
      where: { toUserId: user.sub, status: 'pending' },
      include: { room: true, fromUser: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async respondInvitation(user: JwtPayload, invitationId: string, action: 'accept' | 'decline') {
    const invite = await this.prisma.chatInvitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.toUserId !== user.sub) {
      throw new NotFoundException('초대를 찾을 수 없습니다');
    }
    if (invite.status !== 'pending') {
      throw new BadRequestException('이미 처리된 초대입니다');
    }
    const updated = await this.prisma.chatInvitation.update({
      where: { id: invitationId },
      data: { status: action === 'accept' ? 'accepted' : 'declined' }
    });
    if (action === 'accept') {
      await this.prisma.chatMember.upsert({
        where: { userId_roomId: { userId: user.sub, roomId: invite.roomId } },
        update: {},
        create: { userId: user.sub, roomId: invite.roomId }
      });
    }
    return updated;
  }
}
