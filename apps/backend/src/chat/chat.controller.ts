import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.chatService.getMessage();
  }
}
