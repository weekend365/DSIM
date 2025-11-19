import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.profilesService.getMessage();
  }
}
