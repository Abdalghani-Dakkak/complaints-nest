import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Citizen } from './entities/citizen.entity';
import { CitizensService } from './citizens.service';

@Module({
  imports: [TypeOrmModule.forFeature([Citizen])],
  providers: [CitizensService],
  exports: [CitizensService],
})
export class CitizensModule {}
