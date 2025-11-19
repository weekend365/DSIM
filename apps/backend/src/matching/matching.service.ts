import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class MatchingService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement matching module' };
  }
}
