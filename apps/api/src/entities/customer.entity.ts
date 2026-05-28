import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Color } from './color.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ length: 3 })
  cpfStart: string;

  @Column({ length: 2 })
  cpfEnd: string;

  @Column({ unique: true })
  cpfHash: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ManyToOne(() => Color, (color) => color.customers, { eager: true })
  color: Color;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
