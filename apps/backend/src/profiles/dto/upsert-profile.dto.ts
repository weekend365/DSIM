import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IsArray } from 'class-validator';

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

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  travelStyles?: string[];

  @IsOptional()
  @IsString()
  travelPace?: string;

  @IsOptional()
  @IsString()
  budgetPreference?: string;
}
