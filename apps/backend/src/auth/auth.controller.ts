import { Body, Controller, Get, Post } from '@nestjs/common';
import type { ApiResponse, SignInRequest, SignInResponse } from '@dsim/shared';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.authService.getMessage();
  }

  @Post('signin')
  signIn(@Body() payload: SignInRequest): SignInResponse {
    return this.authService.signIn(payload);
  }
}
