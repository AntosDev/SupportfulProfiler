import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column()
  industry: string;

  @Column({ nullable: true })
  website?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  primaryContactName: string;

  @Column()
  primaryContactEmail: string;

  @Column({ nullable: true })
  primaryContactPhone?: string;

  @Column('simple-array', { nullable: true })
  locations?: string[];

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Assignment, assignment => assignment.client)
  assignments: Assignment[];

  @Column('simple-json', { nullable: true })
  requirements?: Record<string, any>;

  @Column('simple-json', { nullable: true })
  additionalInfo?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 