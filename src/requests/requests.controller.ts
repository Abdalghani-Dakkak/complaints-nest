import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { MyRequestsQueryDto } from './dto/my-requests-query.dto';
import { RequirePermission } from '../auth/require-permission.decorator';
import { Public } from '../auth/public.decorator';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  // PUBLIC — any citizen can submit without logging in.
  @Post()
  @Public()
  create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto);
  }

  // PUBLIC — a citizen looks up their own requests by national number.
  // Declared before :id so "my" isn't captured by the :id route.
  @Get('my')
  @Public()
  findMine(@Query() query: MyRequestsQueryDto) {
    return this.service.findByCitizen(query.nationalNumber);
  }

  // Staff (complaints.admin) — list all requests with citizen + category.
  @Get()
  @RequirePermission('complaints.view_all')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermission('complaints.view_all')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/assign')
  @RequirePermission('complaints.assign')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRequestDto) {
    return this.service.assign(id, dto);
  }

  @Patch(':id/respond')
  @RequirePermission('complaints.respond')
  respond(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondRequestDto,
  ) {
    return this.service.respond(id, dto);
  }

  @Delete(':id')
  @RequirePermission('complaints.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
