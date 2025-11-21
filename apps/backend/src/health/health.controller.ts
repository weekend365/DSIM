import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResponse } from '@dsim/shared';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthCheckResponse {
    return {
      message: 'ok',
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
