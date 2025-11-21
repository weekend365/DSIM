import { Injectable } from '@nestjs/common';
import type { ApiResponse, JwtPayload, SignInRequest, SignInResponse } from '@dsim/shared';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  getMessage(): ApiResponse {
    return { message: 'Auth module ready' };
  }

  signIn(payload: SignInRequest): SignInResponse {
    // TODO: Replace with real user validation and password hashing.
    const userId = 'user-123';
    const jwtPayload: JwtPayload = { sub: userId, email: payload.email, role: 'traveler' };
    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      message: 'Sign-in success',
      data: {
        accessToken,
        expiresIn: 60 * 60
      }
    };
  }
}
