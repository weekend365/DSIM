import { IsString, IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  toUserId!: string;
}
