import { Module } from '@nestjs/common';
import { TravelPostsController } from './travel-posts.controller';
import { TravelPostsService } from './travel-posts.service';

@Module({
  controllers: [TravelPostsController],
  providers: [TravelPostsService]
})
export class TravelPostsModule {}
