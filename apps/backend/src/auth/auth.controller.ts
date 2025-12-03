import { Body, Controller, Get, Post, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
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
import type { Request, Response } from 'express';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.authService.getMessage();
  }

  @Post('signup')
  async signUp(@Body() payload: SignUpDto, @Res({ passthrough: true }) res: Response): Promise<SignUpResponse> {
    const result = await this.authService.signUp(payload);
    this.setAuthCookies(res, result, payload.rememberMe);
    return result;
  }

  @Post('signin')
  async signIn(@Body() payload: SignInDto, @Res({ passthrough: true }) res: Response): Promise<SignInResponse> {
    const result = await this.authService.signInAsync(payload);
    this.setAuthCookies(res, result, payload.rememberMe);
    return result;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response
  ): Promise<SignInResponse> {
    const refreshCookie = req.cookies?.['dsim_refresh'];
    const csrfHeader = req.headers['x-csrf-token'] as string | undefined;
    const csrfCookie = req.cookies?.['dsim_csrf'];
    if (!refreshCookie) {
      throw new UnauthorizedException('No refresh token');
    }
    if (!csrfHeader || csrfHeader !== csrfCookie) {
      throw new UnauthorizedException('Invalid CSRF token');
    }
    const result = await this.authService.refreshTokens(refreshCookie);
    this.setAuthCookies(res, { data: result }, true);
    return { message: 'Refreshed', data: { accessToken: result.accessToken, expiresIn: result.expiresIn } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: JwtPayload }): ApiResponse<JwtPayload> {
    return { message: 'Current session', data: req.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): ApiResponse {
    res.clearCookie('dsim_access', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.clearCookie('dsim_refresh', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.clearCookie('dsim_csrf', {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return { message: 'Logged out' };
  }

  private setAuthCookies(
    res: Response,
    result: { data?: { accessToken?: string; refreshToken?: string; expiresIn?: number; refreshExpiresIn?: number } },
    remember?: boolean
  ) {
    if (result.data?.accessToken) {
      res.cookie('dsim_access', result.data.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: (result.data.expiresIn ?? 3600) * 1000
      });
    }
    if (result.data?.refreshToken) {
      const maxAge = result.data.refreshExpiresIn
        ? result.data.refreshExpiresIn * 1000
        : remember
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;
      res.cookie('dsim_refresh', result.data.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge
      });
    }
    const csrfToken = randomBytes(24).toString('hex');
    res.cookie('dsim_csrf', csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }
}
