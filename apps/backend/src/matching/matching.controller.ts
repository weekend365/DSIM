import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.matchingService.getMessage();
  }
}
