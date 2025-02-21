import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileNote } from './entities/profile-note.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileNoteDto } from './dto/create-profile-note.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ProfileNote)
    private readonly noteRepository: Repository<ProfileNote>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create(createProfileDto);
    return await this.profileRepository.save(profile);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    skills?: string[] | string;
    availability?: string;
    yearsOfExperience?: string;
    expectedRate?: number;
    minExperience?: number;
    maxExperience?: number;
  }): Promise<Profile[]> {
    const { 
      skip = 0, 
      take = 50,
      searchTerm, 
      skills, 
      availability, 
      yearsOfExperience,
      expectedRate,
      minExperience,
      maxExperience 
    } = params;

    console.log('Received params:', params);
    
    const queryBuilder = this.profileRepository.createQueryBuilder('profile');

    // Only apply pagination if explicitly requested
    if (typeof skip === 'number' && skip > 0) {
      queryBuilder.skip(skip);
    }
    if (typeof take === 'number' && take > 0) {
      queryBuilder.take(take);
    }

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      // Use LIKE with wildcards for partial matches
      const searchPattern = `%${searchTerm.trim()}%`;
      queryBuilder.andWhere(
        '(LOWER(profile.firstName) LIKE LOWER(:searchPattern) OR LOWER(profile.lastName) LIKE LOWER(:searchPattern))',
        { searchPattern }
      );
    }
    
    if (skills && (Array.isArray(skills) || (typeof skills === 'string' && skills.trim()))) {
      // Convert skills to array if it's a string
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
      
      if (skillsArray.length > 0) {
        // For SQLite, use case-insensitive comparison for skills
        skillsArray.forEach((skill, index) => {
          queryBuilder.andWhere(
            `EXISTS (
              SELECT 1 FROM json_each(profile.skills)
              WHERE LOWER(json_each.value) = LOWER(:skill${index})
            )`,
            { [`skill${index}`]: skill }
          );
        });
      }
    }
    
    if (availability && typeof availability === 'string' && availability.trim()) {
      queryBuilder.andWhere('profile.availability = :availability', { availability });
    }
    
    // Handle experience filtering
    if (typeof minExperience === 'number') {
      queryBuilder.andWhere('profile.yearsOfExperience >= :minExperience', { minExperience });
    }
    if (typeof maxExperience === 'number') {
      queryBuilder.andWhere('profile.yearsOfExperience <= :maxExperience', { maxExperience });
    }

    if (typeof expectedRate === 'number' && !isNaN(expectedRate)) {
      queryBuilder.andWhere('profile.expectedRate = :expectedRate', { expectedRate });
    }

    queryBuilder.orderBy('profile.createdAt', 'DESC');

    const query = queryBuilder.getSql();
    const parameters = queryBuilder.getParameters();
    console.log('Generated SQL:', query);
    console.log('Query parameters:', parameters);

    const result = await queryBuilder.getMany();
    console.log('Query result count:', result.length);
    
    // Log the years of experience for debugging
    result.forEach(profile => {
      console.log(`Profile ${profile.firstName} ${profile.lastName}: ${profile.yearsOfExperience} years`);
    });

    return result;
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.client', 'notes'],
    });
    
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.findOne(id);
    Object.assign(profile, updateProfileDto);
    return await this.profileRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const result = await this.profileRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
  }

  async searchBySkills(skills: string[]): Promise<Profile[]> {
    if (!skills.length) {
      return [];
    }

    const queryBuilder = this.profileRepository.createQueryBuilder('profile');
    
    // Use the same skills search as findAll
    skills.forEach((skill, index) => {
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM json_each(profile.skills)
          WHERE json_each.value = :skill${index}
        )`,
        { [`skill${index}`]: skill }
      );
    });

    return await queryBuilder.getMany();
  }

  async findAvailable(): Promise<Profile[]> {
    return await this.profileRepository.find({
      where: { isAvailable: true },
      order: { yearsOfExperience: 'DESC' },
    });
  }

  async addNote(profileId: string, createNoteDto: CreateProfileNoteDto): Promise<ProfileNote> {
    const profile = await this.findOne(profileId);
    
    const note = this.noteRepository.create({
      ...createNoteDto,
      profile
    });

    return await this.noteRepository.save(note);
  }

  async deleteNote(profileId: string, noteId: string): Promise<void> {
    const profile = await this.findOne(profileId);
    const note = await this.noteRepository.findOne({
      where: { id: noteId, profile: { id: profileId } }
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found for profile ${profileId}`);
    }

    await this.noteRepository.remove(note);
  }
} 