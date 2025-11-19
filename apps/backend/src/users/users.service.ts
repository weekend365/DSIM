import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class UsersService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement users module' };
  }
}
