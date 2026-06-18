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

  @ManyToOne(() => Category, (c) => c.requests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({ type: 'enum', enum: RequestType, default: RequestType.REQUEST })
  type!: RequestType;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({ name: 'submitter_user_id' })
  submitterUserId!: number;

  @Column({ name: 'assigned_to_user_id', nullable: true })
  assignedToUserId!: number;

  @Column({ type: 'text', nullable: true })
  response!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
