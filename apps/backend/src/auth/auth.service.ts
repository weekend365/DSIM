import type {
  ApiResponse,
  JwtPayload,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  UserRecord,
} from '@dsim/shared';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private ACCESS_EXPIRES_IN_SECONDS = 15 * 60; // 15 minutes
  private REFRESH_SHORT_SECONDS = 7 * 24 * 60 * 60; // 7 days
  private REFRESH_LONG_SECONDS = 30 * 24 * 60 * 60; // 30 days

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  getMessage(): ApiResponse {
    return { message: 'Auth module ready' };
  }

  async signUp(payload: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.usersService.createUser(payload);
    const token = await this.issueTokens(user.id, user.email, user.role, payload.rememberMe);
    return {
      message: 'Sign-up success',
      data: token,
    };
  }

  signIn(payload: SignInRequest): SignInResponse {
    throw new BadRequestException('Use async signInAsync');
  }

  async signInAsync(payload: SignInRequest): Promise<SignInResponse> {
    const user = await this.usersService.verifyUser(payload.email, payload.password);
    const token = await this.issueTokens(user.id, user.email, user.role, payload.rememberMe);

    return {
      message: 'Sign-in success',
      data: token,
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored || !stored.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    // rotate: revoke old token and issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
    const tokens = await this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      true,
    );
    return tokens;
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string | UserRecord['role'],
    remember?: boolean,
  ) {
    const jwtPayload: JwtPayload = { sub: userId, email, role };
    const accessExpiresIn = this.ACCESS_EXPIRES_IN_SECONDS;
    const refreshExpiresIn = remember ? this.REFRESH_LONG_SECONDS : this.REFRESH_SHORT_SECONDS;
    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: accessExpiresIn });
    const refreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn,
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
