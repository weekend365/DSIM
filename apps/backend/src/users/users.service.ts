import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import type { ApiResponse, SignUpRequest, UserRecord } from '@dsim/shared';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private users: UserRecord[] = [];

  getMessage(): ApiResponse {
    return { message: 'Users module ready' };
  }

  async createUser(payload: SignUpRequest, role: UserRecord['role'] = 'traveler'): Promise<UserRecord> {
    const existing = await this.findByEmail(payload.email);
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user: UserRecord = {
      id: randomUUID(),
      email: payload.email,
      name: payload.name,
      role,
      passwordHash
    };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async verifyUser(email: string, password: string): Promise<UserRecord> {
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
