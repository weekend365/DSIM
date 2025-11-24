import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import type { ApiResponse, SignUpRequest, UserRecord } from '@dsim/shared';
import bcrypt from 'bcryptjs';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getMessage(): ApiResponse {
    return { message: 'Users module ready' };
  }

  async createUser(payload: SignUpRequest, role: UserRecord['role'] = 'traveler'): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const data: Prisma.UserCreateInput = {
      email: payload.email,
      name: payload.name,
      role: role as any,
      passwordHash
    };
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }
}
