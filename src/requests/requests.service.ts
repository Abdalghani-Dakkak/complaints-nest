import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintRequest, RequestStatus } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { AssignRequestDto } from './dto/assign-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { CategoriesService } from '../categories/categories.service';
import { CitizensService } from '../citizens/citizens.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ComplaintRequest)
    private readonly repo: Repository<ComplaintRequest>,
    private readonly categoriesService: CategoriesService,
    private readonly citizensService: CitizensService,
  ) {}

  // Public submission: upsert the citizen (by national number), then file the request.
  async create(dto: CreateRequestDto): Promise<ComplaintRequest> {
    const category = await this.categoriesService.findOne(dto.categoryId);
    const citizen = await this.citizensService.upsertByNationalNumber(
      dto.citizen,
    );
    const request = this.repo.create({
      description: dto.description,
      type: dto.type,
      category,
      citizen,
    });
    return this.repo.save(request);
  }

  findAll(): Promise<ComplaintRequest[]> {
    return this.repo.find({
      relations: { category: true, citizen: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Public lookup: a citizen retrieves their own requests by national number.
  // Returns [] for an unknown national number (no existence leak, no 404).
  findByCitizen(nationalNumber: string): Promise<ComplaintRequest[]> {
    return this.repo.find({
      where: { citizen: { nationalNumber } },
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ComplaintRequest> {
    const request = await this.repo.findOne({
      where: { id },
      relations: { category: true, citizen: true },
    });
    if (!request) throw new NotFoundException(`Request #${id} not found`);
    return request;
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
