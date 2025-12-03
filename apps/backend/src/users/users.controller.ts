import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.usersService.getMessage();
  }

  @Get('search')
  search(@Query('q') q?: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('검색어는 최소 2자 이상이어야 합니다');
    }
    return this.usersService.searchUsers(q.trim());
  }
}
