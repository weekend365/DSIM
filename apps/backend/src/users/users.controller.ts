import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.usersService.getMessage();
  }
}
