import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.authService.getMessage();
  }
}
