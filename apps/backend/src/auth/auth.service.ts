import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class AuthService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement auth module' };
  }
}
