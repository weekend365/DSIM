import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowsService } from './follows.service';
import type { JwtPayload } from '@dsim/shared';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  follow(@Req() req: { user: JwtPayload }, @Param('userId') userId: string) {
    return this.followsService.follow(req.user, userId);
  }

  @Delete(':userId')
  unfollow(@Req() req: { user: JwtPayload }, @Param('userId') userId: string) {
    return this.followsService.unfollow(req.user, userId);
  }

  @Get('followers')
  listFollowers(@Req() req: { user: JwtPayload }) {
    return this.followsService.listFollowers(req.user.sub);
  }

  @Get('following')
  listFollowing(@Req() req: { user: JwtPayload }) {
    return this.followsService.listFollowing(req.user.sub);
  }
}
