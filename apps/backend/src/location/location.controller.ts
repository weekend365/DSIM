import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.locationService.getMessage();
  }
}
