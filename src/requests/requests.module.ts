import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintRequest } from './entities/request.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { CategoriesModule } from '../categories/categories.module';
import { CitizensModule } from '../citizens/citizens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintRequest]),
    CategoriesModule,
    CitizensModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
