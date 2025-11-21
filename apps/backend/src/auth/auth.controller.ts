import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import type { ApiResponse, SignInRequest, SignInResponse, JwtPayload } from '@dsim/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.authService.getMessage();
  }

  @Post('signin')
  signIn(@Body() payload: SignInDto): SignInResponse {
    return this.authService.signIn(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: JwtPayload }): ApiResponse<JwtPayload> {
    return { message: 'Current session', data: req.user };
  }
}
