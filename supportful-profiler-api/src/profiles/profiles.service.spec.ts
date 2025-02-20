import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { testDatabaseConfig } from '../config/test.config';
import { NotFoundException } from '@nestjs/common';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Profile]),
      ],
      providers: [ProfilesService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new profile', async () => {
      const createProfileDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        skills: ['JavaScript', 'TypeScript'],
        summary: 'Experienced developer',
        yearsOfExperience: 5,
      };

      const profile = await service.create(createProfileDto);

      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.firstName).toBe(createProfileDto.firstName);
      expect(profile.lastName).toBe(createProfileDto.lastName);
      expect(profile.email).toBe(createProfileDto.email);
      expect(Array.isArray(profile.skills)).toBe(true);
      expect(profile.skills).toEqual(expect.arrayContaining(createProfileDto.skills));
    });
  });

  describe('findAll', () => {
    it('should return an array of profiles', async () => {
      const [profiles, count] = await service.findAll({});
      
      expect(Array.isArray(profiles)).toBe(true);
      expect(typeof count).toBe('number');
    });

    it('should filter profiles by searchTerm', async () => {
      const [profiles] = await service.findAll({ searchTerm: 'John' });
      
      expect(profiles.length).toBeGreaterThan(0);
      expect(profiles[0].firstName).toBe('John');
    });

    it('should filter profiles by skills', async () => {
      const [profiles] = await service.findAll({ skills: ['JavaScript'] });
      
      expect(profiles.length).toBeGreaterThan(0);
      expect(Array.isArray(profiles[0].skills)).toBe(true);
      expect(profiles[0].skills).toEqual(expect.arrayContaining(['JavaScript']));
    });
  });

  describe('findOne', () => {
    let profileId: string;

    beforeAll(async () => {
      const profile = await service.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        skills: ['Python', 'Django'],
        summary: 'Backend developer',
        yearsOfExperience: 3,
      });
      profileId = profile.id;
    });

    it('should return a profile by id', async () => {
      const profile = await service.findOne(profileId);
      
      expect(profile).toBeDefined();
      expect(profile.id).toBe(profileId);
      expect(Array.isArray(profile.skills)).toBe(true);
    });

    it('should throw NotFoundException when profile not found', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let profileId: string;

    beforeAll(async () => {
      const profile = await service.create({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        skills: ['Java', 'Spring'],
        summary: 'Java developer',
        yearsOfExperience: 4,
      });
      profileId = profile.id;
    });

    it('should update a profile', async () => {
      const updateProfileDto = {
        firstName: 'Robert',
        yearsOfExperience: 5,
        skills: ['Java', 'Spring', 'Hibernate'],
      };

      const updated = await service.update(profileId, updateProfileDto);

      expect(updated.firstName).toBe(updateProfileDto.firstName);
      expect(updated.yearsOfExperience).toBe(updateProfileDto.yearsOfExperience);
      expect(Array.isArray(updated.skills)).toBe(true);
      expect(updated.skills).toEqual(expect.arrayContaining(updateProfileDto.skills));
    });

    it('should throw NotFoundException when updating non-existent profile', async () => {
      await expect(
        service.update('non-existent-id', { firstName: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    let profileId: string;

    beforeAll(async () => {
      const profile = await service.create({
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@example.com',
        skills: ['React', 'Node.js'],
        summary: 'Full-stack developer',
        yearsOfExperience: 2,
      });
      profileId = profile.id;
    });

    it('should remove a profile', async () => {
      await service.remove(profileId);
      await expect(service.findOne(profileId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when removing non-existent profile', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchBySkills', () => {
    let testProfile: Profile;

    beforeAll(async () => {
      testProfile = await service.create({
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        skills: ['React', 'Angular', 'Vue'],
        summary: 'Frontend developer',
        yearsOfExperience: 3,
      });
    });

    it('should find profiles by skills', async () => {
      const profiles = await service.searchBySkills(['React']);
      
      expect(profiles.length).toBeGreaterThan(0);
      expect(Array.isArray(profiles[0].skills)).toBe(true);
      expect(profiles[0].skills).toEqual(expect.arrayContaining(['React']));
    });

    it('should return empty array when no matching skills', async () => {
      const profiles = await service.searchBySkills(['non-existent-skill']);
      expect(profiles).toHaveLength(0);
    });

    afterAll(async () => {
      await service.remove(testProfile.id);
    });
  });
}); 