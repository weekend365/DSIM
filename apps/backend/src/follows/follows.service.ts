import { BadRequestException, Injectable } from '@nestjs/common';
import type { JwtPayload } from '@dsim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  async follow(user: JwtPayload, targetUserId: string) {
    if (user.sub === targetUserId) throw new BadRequestException('자기 자신은 팔로우할 수 없습니다');
    const target = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw new BadRequestException('존재하지 않는 사용자입니다');
    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId: user.sub, followingId: targetUserId } },
      update: {},
      create: { followerId: user.sub, followingId: targetUserId }
    });

    await this.notifications.createForUser(targetUserId, {
      type: 'follow',
      title: '새 팔로워',
      message: `${user.email}님이 팔로우하기 시작했습니다`
    });
    return { message: '팔로우 완료' };
  }

  async unfollow(user: JwtPayload, targetUserId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId: user.sub, followingId: targetUserId }
    });
    return { message: '팔로우 취소' };
  }

  async listFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, email: true, name: true } } }
    });
  }

  async listFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, email: true, name: true } } }
    });
  }
}
