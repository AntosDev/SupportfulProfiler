import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { ProfileNote } from './profile-note.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column('simple-json')
  skills: string[];

  @Column('text')
  summary: string;

  @Column({ type: 'int' })
  yearsOfExperience: number;

  @Column({ nullable: true })
  linkedInUrl?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expectedRate?: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column('simple-json', { nullable: true })
  preferredLocations?: string[];

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => Assignment, assignment => assignment.profile)
  assignments: Assignment[];

  @OneToMany(() => ProfileNote, note => note.profile)
  notes: ProfileNote[];

  @Column('simple-json', { nullable: true })
  additionalInfo?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  transformArrays() {
    if (this.skills && !Array.isArray(this.skills)) {
      this.skills = JSON.parse(this.skills as any);
    }
    if (this.preferredLocations && !Array.isArray(this.preferredLocations)) {
      this.preferredLocations = JSON.parse(this.preferredLocations as any);
    }
  }
} 