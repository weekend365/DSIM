import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class ChatService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement chat module' };
  }
}
