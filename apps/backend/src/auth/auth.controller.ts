import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import type {
  ApiResponse,
  SignInRequest,
  SignInResponse,
  JwtPayload,
  SignUpResponse
} from '@dsim/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.authService.getMessage();
  }

  @Post('signup')
  async signUp(@Body() payload: SignUpDto): Promise<SignUpResponse> {
    return this.authService.signUp(payload);
  }

  @Post('signin')
  async signIn(@Body() payload: SignInDto): Promise<SignInResponse> {
    return this.authService.signInAsync(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: JwtPayload }): ApiResponse<JwtPayload> {
    return { message: 'Current session', data: req.user };
  }
}
