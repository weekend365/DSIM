import { Injectable, NotFoundException } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTravelPostDto } from './dto/create-travel-post.dto';

@Injectable()
export class TravelPostsService {
  constructor(private readonly prisma: PrismaService) {}

  getMessage(): ApiResponse {
    return { message: 'TODO: Implement travel-posts module' };
  }

  async listPosts() {
    return this.prisma.travelPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, email: true, name: true } } }
    });
  }

  async createPost(input: CreateTravelPostDto) {
    const { creatorId, ...rest } = input;
    return this.prisma.travelPost.create({
      data: {
        ...rest,
        startDate: rest.startDate ? new Date(rest.startDate) : undefined,
        endDate: rest.endDate ? new Date(rest.endDate) : undefined,
        creator: { connect: { id: creatorId } }
      }
    });
  }

  async getPostById(id: string) {
    const post = await this.prisma.travelPost.findUnique({
      where: { id },
      include: { creator: { select: { id: true, email: true, name: true } } }
    });
    if (!post) {
      throw new NotFoundException('Travel post not found');
    }
    return post;
  }
}
