import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Assignment } from './assignment.entity';

@Entity()
export class AssignmentNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Assignment, assignment => assignment.notes)
  assignment: Assignment;

  @Column('text')
  content: string;

  @Column()
  type: 'general' | 'interview' | 'feedback' | 'performance' | 'issue';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 