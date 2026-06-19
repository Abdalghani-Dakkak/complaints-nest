import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateCitizenDto } from '../../citizens/dto/create-citizen.dto';
import { RequestType } from '../entities/request.entity';

export class CreateRequestDto {
  // Citizen info — first/last name, email, phone, address, national number
  @ValidateNested()
  @Type(() => CreateCitizenDto)
  citizen!: CreateCitizenDto;

  // Complaint info — category + description
  @IsInt()
  categoryId!: number;

  @IsString()
  description!: string;

  @IsEnum(RequestType)
  @IsOptional()
  type?: RequestType;
}
