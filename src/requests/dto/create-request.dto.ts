import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RequestType } from '../entities/request.entity';

export class CreateRequestDto {
  @IsInt()
  categoryId!: number;

  @IsEnum(RequestType)
  @IsOptional()
  type?: RequestType;

  @IsString()
  subject!: string;

  @IsString()
  description!: string;
}
