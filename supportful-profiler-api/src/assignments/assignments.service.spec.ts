import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { ClientsService } from '../clients/clients.service';
import { Profile } from '../profiles/entities/profile.entity';
import { Client } from '../clients/entities/client.entity';
import { testDatabaseConfig } from '../config/test.config';
import { NotFoundException } from '@nestjs/common';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let profilesService: ProfilesService;
  let clientsService: ClientsService;
  let module: TestingModule;
  let testProfile: Profile;
  let testClient: Client;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Assignment, Profile, Client]),
      ],
      providers: [AssignmentsService, ProfilesService, ClientsService],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    profilesService = module.get<ProfilesService>(ProfilesService);
    clientsService = module.get<ClientsService>(ClientsService);

    // Create test profile and client
    testProfile = await profilesService.create({
      firstName: 'Test',
      lastName: 'Developer',
      email: 'test.dev@example.com',
      skills: ['JavaScript'],
      summary: 'Test developer',
      yearsOfExperience: 5,
    });

    testClient = await clientsService.create({
      companyName: 'Test Corp',
      industry: 'Technology',
      primaryContactName: 'Test Contact',
      primaryContactEmail: 'contact@testcorp.com',
    });
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new assignment', async () => {
      const createAssignmentDto = {
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate: new Date(),
        rate: 100,
      };

      const assignment = await service.create(createAssignmentDto);

      expect(assignment).toBeDefined();
      expect(assignment.id).toBeDefined();
      expect(assignment.profile.id).toBe(testProfile.id);
      expect(assignment.client.id).toBe(testClient.id);
    });

    it('should throw NotFoundException when profile not found', async () => {
      await expect(
        service.create({
          profileId: 'non-existent-id',
          clientId: testClient.id,
          startDate: new Date(),
          rate: 100,
        })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of assignments', async () => {
      const [assignments, count] = await service.findAll({});
      
      expect(Array.isArray(assignments)).toBe(true);
      expect(typeof count).toBe('number');
    });

    it('should filter assignments by status', async () => {
      const [assignments] = await service.findAll({ status: 'pending' });
      
      expect(Array.isArray(assignments)).toBe(true);
      if (assignments.length > 0) {
        expect(assignments[0].status).toBe('pending');
      }
    });

    it('should filter assignments by date range', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const newAssignment = await service.create({
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate,
        endDate,
        rate: 100,
      });

      const [assignments] = await service.findAll({ startDate, endDate });
      expect(Array.isArray(assignments)).toBe(true);
      if (assignments.length > 0) {
        const foundAssignment = assignments.find(a => a.id === newAssignment.id);
        expect(foundAssignment).toBeDefined();
      }
    });
  });

  describe('findOne', () => {
    let assignmentId: string;

    beforeAll(async () => {
      const assignment = await service.create({
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate: new Date(),
        rate: 100,
      });
      assignmentId = assignment.id;
    });

    it('should return an assignment by id', async () => {
      const assignment = await service.findOne(assignmentId);
      
      expect(assignment).toBeDefined();
      expect(assignment.id).toBe(assignmentId);
    });

    it('should throw NotFoundException when assignment not found', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let assignmentId: string;

    beforeAll(async () => {
      const assignment = await service.create({
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate: new Date(),
        rate: 100,
      });
      assignmentId = assignment.id;
    });

    it('should update an assignment', async () => {
      const updateAssignmentDto = {
        status: 'active',
        rate: 150,
      };

      const updated = await service.update(assignmentId, updateAssignmentDto);

      expect(updated.status).toBe(updateAssignmentDto.status);
      expect(updated.rate).toBe(updateAssignmentDto.rate);
    });

    it('should throw NotFoundException when updating non-existent assignment', async () => {
      await expect(
        service.update('non-existent-id', { status: 'active' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    let assignmentId: string;

    beforeAll(async () => {
      const assignment = await service.create({
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate: new Date(),
        rate: 100,
      });
      assignmentId = assignment.id;
    });

    it('should remove an assignment', async () => {
      await service.remove(assignmentId);
      await expect(service.findOne(assignmentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when removing non-existent assignment', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAssignmentsByProfile', () => {
    let testAssignment: Assignment;

    beforeAll(async () => {
      testAssignment = await service.create({
        profileId: testProfile.id,
        clientId: testClient.id,
        startDate: new Date(),
        rate: 100,
      });
    });

    it('should find assignments by profile', async () => {
      const assignments = await service.findAssignmentsByProfile(testProfile.id);
      
      expect(Array.isArray(assignments)).toBe(true);
      expect(assignments.length).toBeGreaterThan(0);
      const foundAssignment = assignments.find(a => a.id === testAssignment.id);
      expect(foundAssignment).toBeDefined();
      expect(foundAssignment?.profile).toBeDefined();
      expect(foundAssignment?.profile.id).toBe(testProfile.id);
    });

    it('should return empty array when no assignments found', async () => {
      const assignments = await service.findAssignmentsByProfile('non-existent-id');
      expect(assignments).toHaveLength(0);
    });

    afterAll(async () => {
      if (testAssignment?.id) {
        await service.remove(testAssignment.id);
      }
    });
  });
}); 