import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertProfileDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  interests?: string;

  @IsOptional()
  @IsString()
  languages?: string;
}
