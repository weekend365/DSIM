import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.reviewsService.getMessage();
  }
}
