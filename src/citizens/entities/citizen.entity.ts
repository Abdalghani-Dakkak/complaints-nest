import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintRequest } from '../../requests/entities/request.entity';

@Entity('citizens')
export class Citizen {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column()
  address!: string;

  // Unique business key — citizens are deduplicated/identified by this.
  // It is also the column the requests table references (relation by national number).
  @Column({ name: 'national_number', unique: true })
  nationalNumber!: string;

  @OneToMany(() => ComplaintRequest, (r) => r.citizen)
  requests!: ComplaintRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
