import { Injectable, NotFoundException } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  getMessage(): ApiResponse {
    return { message: 'TODO: Implement profiles module' };
  }

  async upsertProfile(input: UpsertProfileDto) {
    const { userId, bio, interests, languages, location } = input;
    return this.prisma.profile.upsert({
      where: { userId },
      update: { bio, interests, languages, location },
      create: { userId, bio, interests, languages, location }
    });
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
