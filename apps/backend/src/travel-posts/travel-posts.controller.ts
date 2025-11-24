import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { TravelPostsService } from './travel-posts.service';
import { CreateTravelPostDto } from './dto/create-travel-post.dto';

@Controller('travel-posts')
export class TravelPostsController {
  constructor(private readonly travelPostsService: TravelPostsService) {}

  @Get()
  getPosts() {
    return this.travelPostsService.listPosts();
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.travelPostsService.getPostById(id);
  }

  @Post()
  createPost(@Body() body: CreateTravelPostDto) {
    return this.travelPostsService.createPost(body);
  }
}
