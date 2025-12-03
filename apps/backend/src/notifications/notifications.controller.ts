import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import type { JwtPayload } from '@dsim/shared';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@Req() req: { user: JwtPayload }) {
    return this.notificationsService.listForUser(req.user.sub);
  }

  @Post()
  create(@Req() req: { user: JwtPayload }, @Body() body: CreateNotificationDto) {
    return this.notificationsService.createForUser(body.userId ?? req.user.sub, body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }
}
