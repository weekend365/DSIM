import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ExpensesModule } from './expenses/expenses.module';
import { LocationModule } from './location/location.module';
import { HealthModule } from './health/health.module';
import { MatchingModule } from './matching/matching.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TravelPostsModule } from './travel-posts/travel-posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    TravelPostsModule,
    MatchingModule,
    ChatModule,
    ExpensesModule,
    ReviewsModule,
    LocationModule,
    HealthModule
  ]
})
export class AppModule {}
