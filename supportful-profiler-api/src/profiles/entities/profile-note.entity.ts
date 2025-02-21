import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Check } from 'typeorm';
import { Profile } from './profile.entity';

export type NoteType = 'general' | 'interview' | 'feedback' | 'performance';

@Entity()
@Check(`"type" IN ('general', 'interview', 'feedback', 'performance')`)
export class ProfileNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('varchar', { length: 20, default: 'general' })
  type: NoteType;

  @ManyToOne(() => Profile, profile => profile.notes)
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 