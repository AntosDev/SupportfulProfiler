import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create(createProfileDto);
    return await this.profileRepository.save(profile);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    skills?: string[];
    isAvailable?: boolean;
    yearsOfExperience?: number;
  }): Promise<Profile[]> {
    const { skip = 0, take = 10, searchTerm, skills, isAvailable, yearsOfExperience } = params;
    
    const queryBuilder = this.profileRepository.createQueryBuilder('profile');
    queryBuilder.skip(skip).take(take);

    if (searchTerm) {
      queryBuilder.andWhere('profile.firstName LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }
    
    if (skills?.length) {
      const skillsConditions = skills.map((skill, index) => {
        const param = `skill${index}`;
        queryBuilder.setParameter(param, `%${skill}%`);
        return `profile.skills LIKE :${param}`;
      });
      queryBuilder.andWhere(`(${skillsConditions.join(' OR ')})`);
    }
    
    if (typeof isAvailable === 'boolean') {
      queryBuilder.andWhere('profile.isAvailable = :isAvailable', { isAvailable });
    }
    
    if (yearsOfExperience !== undefined) {
      queryBuilder.andWhere('profile.yearsOfExperience = :yearsOfExperience', { yearsOfExperience });
    }

    queryBuilder.orderBy('profile.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.client'],
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
    const skillsConditions = skills.map((skill, index) => {
      const param = `skill${index}`;
      queryBuilder.setParameter(param, `%${skill}%`);
      return `profile.skills LIKE :${param}`;
    });
    queryBuilder.where(`(${skillsConditions.join(' OR ')})`);
    return await queryBuilder.getMany();
  }

  async findAvailable(): Promise<Profile[]> {
    return await this.profileRepository.find({
      where: { isAvailable: true },
      order: { yearsOfExperience: 'DESC' },
    });
  }
} 