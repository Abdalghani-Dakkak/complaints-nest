import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RequirePermission } from '../auth/require-permission.decorator';
import { Public } from '../auth/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Post()
  @RequirePermission('complaints.categories.create')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  // PUBLIC — citizens need the category list to submit a request.
  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @RequirePermission('complaints.categories.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('complaints.categories.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
