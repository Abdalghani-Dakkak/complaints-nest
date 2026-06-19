import { IsString, Length } from 'class-validator';

export class MyRequestsQueryDto {
  @IsString()
  @Length(3, 50)
  nationalNumber!: string;
}
