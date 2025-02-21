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

  afterEach(async () => {
    // Clean up the database after each test block
    const profiles = await service.findAll({});
    await Promise.all(
      profiles.map(profile => 
        service.remove(profile.id).catch(() => {
          // Ignore errors during cleanup
        })
      )
    );
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
    beforeEach(async () => {
      // Create test profiles
      await Promise.all([
        service.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          skills: ['JavaScript', 'TypeScript'],
          summary: 'Experienced developer',
          yearsOfExperience: 5,
          isAvailable: true
        }),
        service.create({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          skills: ['Python', 'Django'],
          summary: 'Backend developer',
          yearsOfExperience: 3,
          isAvailable: false
        }),
        service.create({
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.j@example.com',
          skills: ['JavaScript', 'React'],
          summary: 'Frontend developer',
          yearsOfExperience: 5,
          isAvailable: true,
          expectedRate: 40
        })
      ]);
    });

    it('should return paginated profiles', async () => {
      const profiles = await service.findAll({ skip: 0, take: 2 });
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles).toHaveLength(2);
    });

    it('should filter profiles by searchTerm in firstName', async () => {
      const profiles = await service.findAll({ searchTerm: 'John' });
      expect(profiles).toHaveLength(1);
      expect(profiles[0].firstName).toBe('John');
      expect(profiles[0].lastName).toBe('Doe');
    });

    it('should filter profiles by searchTerm in lastName', async () => {
      const profiles = await service.findAll({ searchTerm: 'Smith' });
      expect(profiles).toHaveLength(1);
      expect(profiles[0].firstName).toBe('Jane');
      expect(profiles[0].lastName).toBe('Smith');
    });

    it('should not find profiles with partial name matches', async () => {
      const profiles = await service.findAll({ searchTerm: 'Jo' });
      expect(profiles).toHaveLength(0);
    });

    it('should not match substrings in longer names', async () => {
      const profiles = await service.findAll({ searchTerm: 'John' });
      // const johnsonProfiles = profiles.filter(p => p.lastName === 'Johnson');
      expect(profiles).toHaveLength(0);
    });

    it('should filter profiles by skills with exact matches', async () => {
      const profiles = await service.findAll({ skills: ['JavaScript'] });
      expect(profiles.length).toBe(2);
      profiles.forEach(profile => {
        expect(profile.skills).toContain('JavaScript');
      });
    });

    it('should not find profiles with partial skill matches', async () => {
      const profiles = await service.findAll({ skills: ['Java'] });
      expect(profiles).toHaveLength(0);
    });

    it('should filter profiles by isAvailable', async () => {
      const availableProfiles = await service.findAll({ isAvailable: true });
      expect(availableProfiles.length).toBe(2);
      availableProfiles.forEach(profile => {
        expect(profile.isAvailable).toBe(true);
      });
    });

    it('should filter profiles by yearsOfExperience', async () => {
      const profiles = await service.findAll({ yearsOfExperience: 5 });
      expect(profiles.length).toBe(2);
      profiles.forEach(profile => {
        expect(profile.yearsOfExperience).toBe(5);
      });
    });

    it('should combine multiple filters', async () => {
      const profiles = await service.findAll({
        skills: ['JavaScript'],
        isAvailable: true,
        yearsOfExperience: 5,
        expectedRate: 40
      });
      
      expect(profiles.length).toBe(1);
      expect(profiles[0].firstName).toBe('Mike');
      expect(profiles[0].skills).toEqual(
        expect.arrayContaining(['JavaScript'])
      );
      expect(profiles[0].isAvailable).toBe(true);
      expect(profiles[0].yearsOfExperience).toBe(5);
      expect(profiles[0].expectedRate).toBe(40);
    });

    it('should return empty array when no matches found', async () => {
      const profiles = await service.findAll({
        searchTerm: 'NonExistentName',
        skills: ['NonExistentSkill']
      });
      expect(profiles).toHaveLength(0);
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
  });
}); 