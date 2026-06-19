import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Citizen } from '../../citizens/entities/citizen.entity';

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum RequestType {
  REQUEST = 'request',
  COMPLAINT = 'complaint',
}

@Entity('requests')
export class ComplaintRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relation to the citizen BY NATIONAL NUMBER: the FK column
  // `citizen_national_number` references citizens.national_number (a unique key).
  @ManyToOne(() => Citizen, (c) => c.requests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'citizen_national_number',
    referencedColumnName: 'nationalNumber',
  })
  citizen!: Citizen;

  @ManyToOne(() => Category, (c) => c.requests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'enum', enum: RequestType, default: RequestType.COMPLAINT })
  type!: RequestType;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  // The IAM staff user (complaints.admin) handling this request — set on assign.
  @Column({ name: 'assigned_to_user_id', nullable: true })
  assignedToUserId!: number;

  @Column({ type: 'text', nullable: true })
  response!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
