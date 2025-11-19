import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { TravelPostsService } from './travel-posts.service';

@Controller('travel-posts')
export class TravelPostsController {
  constructor(private readonly travelPostsService: TravelPostsService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.travelPostsService.getMessage();
  }
}
