import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { ProfilesService } from './profiles.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.profilesService.getMessage();
  }

  @Get(':userId')
  getProfile(@Param('userId') userId: string) {
    return this.profilesService.getProfileByUserId(userId);
  }

  @Post()
  upsertProfile(@Body() body: UpsertProfileDto) {
    return this.profilesService.upsertProfile(body);
  }
}
