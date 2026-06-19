import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RequestsModule } from './requests/requests.module';
import { CitizensModule } from './citizens/citizens.module';
import { Category } from './categories/entities/category.entity';
import { ComplaintRequest } from './requests/entities/request.entity';
import { Citizen } from './citizens/entities/citizen.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Category, ComplaintRequest, Citizen],
        synchronize: true,
        ssl:
          config.get<string>('DATABASE_SSL') === 'false'
            ? false
            : { rejectUnauthorized: false },
      }),
    }),
    AuthModule,
    CategoriesModule,
    CitizensModule,
    RequestsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
