import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  participantIds?: string[];
}
