import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IamLogService } from './iam-log.service';
import { IamLoggingInterceptor } from './iam-logging.interceptor';

@Module({
  providers: [
    IamLogService,
    { provide: APP_INTERCEPTOR, useClass: IamLoggingInterceptor },
  ],
})
export class LoggingModule {}
