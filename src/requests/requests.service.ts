import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintRequest, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ComplaintRequest)
    private readonly repo: Repository<ComplaintRequest>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateRequestDto, userId: number): Promise<ComplaintRequest> {
    const category = await this.categoriesService.findOne(dto.categoryId);
    const request = this.repo.create({
      subject: dto.subject,
      description: dto.description,
      type: dto.type,
      category,
      submitterUserId: userId,
    });
    return this.repo.save(request);
  }

  findAll(): Promise<ComplaintRequest[]> {
    return this.repo.find({
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  findByUser(userId: number): Promise<ComplaintRequest[]> {
    return this.repo.find({
      where: { submitterUserId: userId },
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ComplaintRequest> {
    const request = await this.repo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!request) throw new NotFoundException(`Request #${id} not found`);
    return request;
  }

  async update(
    id: number,
    dto: UpdateRequestDto,
    userId: number,
  ): Promise<ComplaintRequest> {
    const request = await this.findOne(id);
    if (request.submitterUserId !== userId) {
      throw new ForbiddenException('You can only edit your own requests');
    }
    if (dto.categoryId) {
      request.category = await this.categoriesService.findOne(dto.categoryId);
    }
    Object.assign(request, {
      subject: dto.subject ?? request.subject,
      description: dto.description ?? request.description,
      type: dto.type ?? request.type,
    });
    return this.repo.save(request);
  }

  async assign(id: number, dto: AssignRequestDto): Promise<ComplaintRequest> {
    const request = await this.findOne(id);
    request.assignedToUserId = dto.assignedToUserId;
    request.status = RequestStatus.IN_PROGRESS;
    return this.repo.save(request);
  }

  async respond(id: number, dto: RespondRequestDto): Promise<ComplaintRequest> {
    const request = await this.findOne(id);
    request.response = dto.response;
    request.status = dto.status ?? RequestStatus.RESOLVED;
    return this.repo.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.repo.remove(request);
  }
}
