import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Profile } from '../../profiles/entities/profile.entity';
import { Client } from '../../clients/entities/client.entity';
import { AssignmentNote } from './assignment-note.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, profile => profile.assignments)
  profile: Profile;

  @ManyToOne(() => Client, client => client.assignments)
  client: Client;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rate?: number;

  @OneToMany(() => AssignmentNote, note => note.assignment, { eager: true, cascade: true })
  notes: AssignmentNote[];

  @Column('simple-json', { nullable: true })
  feedback?: Record<string, any>;

  @Column('simple-json', { nullable: true })
  additionalInfo?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 