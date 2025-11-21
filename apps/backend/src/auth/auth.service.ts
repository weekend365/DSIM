import { Injectable } from '@nestjs/common';
import type {
  ApiResponse,
  JwtPayload,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse
} from '@dsim/shared';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

  getMessage(): ApiResponse {
    return { message: 'Auth module ready' };
  }

  async signUp(payload: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.usersService.createUser(payload);
    const token = this.signToken(user.id, user.email, user.role);
    return {
      message: 'Sign-up success',
      data: token
    };
  }

  signIn(payload: SignInRequest): SignInResponse {
    throw new BadRequestException('Use async signInAsync');
  }

  async signInAsync(payload: SignInRequest): Promise<SignInResponse> {
    const user = await this.usersService.verifyUser(payload.email, payload.password);
    const token = this.signToken(user.id, user.email, user.role);

    return {
      message: 'Sign-in success',
      data: token
    };
  }

  private signToken(userId: string, email: string, role: string) {
    const jwtPayload: JwtPayload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(jwtPayload);
    return {
      accessToken,
      expiresIn: 60 * 60
    };
  }
}
