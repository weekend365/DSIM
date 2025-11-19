import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class ReviewsService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement reviews module' };
  }
}
