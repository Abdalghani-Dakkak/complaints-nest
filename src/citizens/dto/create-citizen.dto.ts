import { IsEmail, IsString, Length } from 'class-validator';

export class CreateCitizenDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  @Length(3, 50)
  nationalNumber!: string;
}
