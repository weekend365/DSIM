import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { SignUpRequest } from '@dsim/shared';

export class SignUpDto implements SignUpRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
