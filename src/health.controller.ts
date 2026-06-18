import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class HealthController {
  @Get()
  @Public()
  health() {
    return { status: 'ok', service: 'complaints-nest' };
  }
}
