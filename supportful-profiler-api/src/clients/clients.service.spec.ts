import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { testDatabaseConfig } from '../config/test.config';
import { NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Client]),
      ],
      providers: [ClientsService],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto = {
        companyName: 'Acme Corp',
        industry: 'Technology',
        primaryContactName: 'John Doe',
        primaryContactEmail: 'john.doe@acme.com',
      };

      const client = await service.create(createClientDto);

      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      expect(client.companyName).toBe(createClientDto.companyName);
      expect(client.industry).toBe(createClientDto.industry);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const [clients, count] = await service.findAll({});
      
      expect(Array.isArray(clients)).toBe(true);
      expect(typeof count).toBe('number');
    });

    it('should filter clients by searchTerm', async () => {
      const [clients] = await service.findAll({ searchTerm: 'Acme' });
      
      expect(clients.length).toBeGreaterThan(0);
      expect(clients[0].companyName).toContain('Acme');
    });

    it('should filter clients by industry', async () => {
      const [clients] = await service.findAll({ industry: 'Technology' });
      
      expect(clients.length).toBeGreaterThan(0);
      expect(clients[0].industry).toBe('Technology');
    });
  });

  describe('findOne', () => {
    let clientId: string;

    beforeAll(async () => {
      const client = await service.create({
        companyName: 'Tech Corp',
        industry: 'Software',
        primaryContactName: 'Jane Smith',
        primaryContactEmail: 'jane.smith@techcorp.com',
      });
      clientId = client.id;
    });

    it('should return a client by id', async () => {
      const client = await service.findOne(clientId);
      
      expect(client).toBeDefined();
      expect(client.id).toBe(clientId);
    });

    it('should throw NotFoundException when client not found', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let clientId: string;

    beforeAll(async () => {
      const client = await service.create({
        companyName: 'Old Corp',
        industry: 'Manufacturing',
        primaryContactName: 'Bob Johnson',
        primaryContactEmail: 'bob.johnson@oldcorp.com',
      });
      clientId = client.id;
    });

    it('should update a client', async () => {
      const updateClientDto = {
        companyName: 'New Corp',
        industry: 'Technology',
      };

      const updated = await service.update(clientId, updateClientDto);

      expect(updated.companyName).toBe(updateClientDto.companyName);
      expect(updated.industry).toBe(updateClientDto.industry);
    });

    it('should throw NotFoundException when updating non-existent client', async () => {
      await expect(
        service.update('non-existent-id', { companyName: 'Test Corp' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    let clientId: string;

    beforeAll(async () => {
      const client = await service.create({
        companyName: 'Delete Corp',
        industry: 'Services',
        primaryContactName: 'Alice Brown',
        primaryContactEmail: 'alice.brown@deletecorp.com',
      });
      clientId = client.id;
    });

    it('should remove a client', async () => {
      await service.remove(clientId);
      await expect(service.findOne(clientId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when removing non-existent client', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIndustry', () => {
    beforeAll(async () => {
      await service.create({
        companyName: 'Tech Solutions',
        industry: 'Software Development',
        primaryContactName: 'Sarah Wilson',
        primaryContactEmail: 'sarah.wilson@techsolutions.com',
      });
    });

    it('should find clients by industry', async () => {
      const clients = await service.findByIndustry('Software');
      
      expect(clients.length).toBeGreaterThan(0);
      expect(clients[0].industry).toContain('Software');
    });

    it('should return empty array when no matching industry', async () => {
      const clients = await service.findByIndustry('non-existent-industry');
      expect(clients).toHaveLength(0);
    });
  });
}); 