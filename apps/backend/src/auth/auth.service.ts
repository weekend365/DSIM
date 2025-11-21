import { Injectable } from '@nestjs/common';
import type { ApiResponse, SignInRequest, SignInResponse } from '@dsim/shared';

@Injectable()
export class AuthService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement auth module' };
  }

  signIn(payload: SignInRequest): SignInResponse {
    // TODO: Replace with real authentication and token issuance.
    return {
      message: 'Mock sign-in success',
      data: {
        accessToken: Buffer.from(`${payload.email}-mock-token`).toString('base64'),
        expiresIn: 60 * 60
      }
    };
  }
}
