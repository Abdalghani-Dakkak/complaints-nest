import { IsInt } from 'class-validator';

export class AssignRequestDto {
  @IsInt()
  assignedToUserId!: number;
}
