import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class TravelPostsService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement travel-posts module' };
  }
}
