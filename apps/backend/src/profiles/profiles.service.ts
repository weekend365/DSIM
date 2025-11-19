import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class ProfilesService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement profiles module' };
  }
}
