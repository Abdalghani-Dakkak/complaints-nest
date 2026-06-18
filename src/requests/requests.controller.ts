import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { RequirePermission } from '../auth/require-permission.decorator';
import { JwtPayload } from '../auth/jwt-auth.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  // Any logged-in user can submit a request
  @Post()
  @RequirePermission('complaints.create')
  create(@Body() dto: CreateRequestDto, @Req() req: any) {
    const user = (req as any).user as JwtPayload;
    return this.service.create(dto, user.sub);
  }

  // Staff sees all requests
  @Get()
  @RequirePermission('complaints.view_all')
  findAll() {
    return this.service.findAll();
  }

  // Any user sees their own requests
  @Get('my')
  @RequirePermission('complaints.view_own')
  findMine(@Req() req: any) {
    const user = (req as any).user as JwtPayload;
    return this.service.findByUser(user.sub);
  }

  // Owner or staff with view_all can see one request
  @Get(':id')
  @RequirePermission('complaints.view_own')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Owner edits their own (subject/description only — no status change)
  @Patch(':id')
  @RequirePermission('complaints.create')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequestDto,
    @Req() req: any,
  ) {
    const user = (req as any).user as JwtPayload;
    return this.service.update(id, dto, user.sub);
  }

  // Staff assigns a request to a user
  @Patch(':id/assign')
  @RequirePermission('complaints.assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRequestDto,
  ) {
    return this.service.assign(id, dto);
  }

  // Staff responds to a request
  @Patch(':id/respond')
  @RequirePermission('complaints.respond')
  respond(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondRequestDto,
  ) {
    return this.service.respond(id, dto);
  }

  // Admin deletes a request
  @Delete(':id')
  @RequirePermission('complaints.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
