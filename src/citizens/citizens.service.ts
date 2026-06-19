import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Citizen } from './entities/citizen.entity';
import { CreateCitizenDto } from './dto/create-citizen.dto';

@Injectable()
export class CitizensService {
  constructor(
    @InjectRepository(Citizen)
    private readonly repo: Repository<Citizen>,
  ) {}

  /**
   * Look the citizen up by national number. If they already exist, refresh
   * their contact details to the latest submission; otherwise create them.
   * National number is the identity — the same person never gets duplicated.
   */
  async upsertByNationalNumber(dto: CreateCitizenDto): Promise<Citizen> {
    const existing = await this.repo.findOne({
      where: { nationalNumber: dto.nationalNumber },
    });
    const citizen = existing
      ? this.repo.merge(existing, dto)
      : this.repo.create(dto);
    return this.repo.save(citizen);
  }

  findAll(): Promise<Citizen[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findByNationalNumber(nationalNumber: string): Promise<Citizen> {
    const citizen = await this.repo.findOne({
      where: { nationalNumber },
      relations: { requests: { category: true } },
    });
    if (!citizen) {
      throw new NotFoundException(`Citizen ${nationalNumber} not found`);
    }
    return citizen;
  }
}
