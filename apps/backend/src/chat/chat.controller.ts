import { Body, Controller, Get, Param, Post, Req, Sse, UseGuards } from '@nestjs/common';
import type { ApiResponse, JwtPayload } from '@dsim/shared';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.chatService.getMessage();
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  createRoom(@Req() req: { user: JwtPayload }, @Body() body: CreateChatRoomDto) {
    return this.chatService.createRoom(req.user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms')
  listRooms(@Req() req: { user: JwtPayload }) {
    return this.chatService.listRooms(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rooms/:id/messages')
  listMessages(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.chatService.listMessages(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Sse('rooms/:id/stream')
  streamMessages(@Req() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.chatService.streamMessages(req.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:id/messages')
  sendMessage(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() body: SendMessageDto
  ) {
    return this.chatService.sendMessage(req.user, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:id/invitations')
  invite(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() body: CreateInvitationDto
  ) {
    return this.chatService.invite(req.user, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invitations')
  listInvitations(@Req() req: { user: JwtPayload }) {
    return this.chatService.listInvitations(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/:id/respond')
  respondInvitation(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() body: RespondInvitationDto
  ) {
    return this.chatService.respondInvitation(req.user, id, body.action);
  }
}
