import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { ExpensesModule } from './expenses/expenses.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './location/location.module';
import { MatchingModule } from './matching/matching.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TravelPostsModule } from './travel-posts/travel-posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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
