import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestStatus } from '../entities/request.entity';

export class RespondRequestDto {
  @IsString()
  response!: string;

  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
