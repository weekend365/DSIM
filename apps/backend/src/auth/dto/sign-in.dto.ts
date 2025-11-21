import { IsEmail, IsString, MinLength } from 'class-validator';
import type { SignInRequest } from '@dsim/shared';

export class SignInDto implements SignInRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
