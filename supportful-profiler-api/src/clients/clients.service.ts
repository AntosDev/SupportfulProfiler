import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    searchTerm?: string;
    industry?: string;
    status?: string;
    location?: string;
  }): Promise<[Client[], number]> {
    const { skip = 0, take = 50, searchTerm, industry, status, location } = params;
    
    console.log('Received client search params:', params);
    
    const queryBuilder = this.clientRepository.createQueryBuilder('client');

    // Only apply pagination if explicitly requested
    if (typeof skip === 'number' && skip > 0) {
      queryBuilder.skip(skip);
    }
    if (typeof take === 'number' && take > 0) {
      queryBuilder.take(take);
    }

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const pattern = `%${searchTerm.trim()}%`;
      queryBuilder.where(
        `(
          LOWER(client.companyName) LIKE LOWER(:pattern) OR 
          LOWER(client.description) LIKE LOWER(:pattern) OR
          LOWER(client.primaryContactName) LIKE LOWER(:pattern) OR
          LOWER(client.industry) LIKE LOWER(:pattern)
        )`,
        { pattern }
      );
    }

    if (industry && typeof industry === 'string' && industry.trim()) {
      queryBuilder.andWhere('LOWER(client.industry) = LOWER(:industry)', { industry: industry.trim() });
    }

    if (status && typeof status === 'string' && status.trim()) {
      queryBuilder.andWhere('client.status = :status', { status: status.trim() });
    }

    if (location && typeof location === 'string' && location.trim()) {
      // Improved location search with case-insensitive comparison
      const locationPattern = location.trim().toLowerCase();
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM unnest(client.locations) loc
          WHERE LOWER(loc) LIKE :locationPattern
        )`,
        { locationPattern: `%${locationPattern}%` }
      );
    }

    queryBuilder.orderBy('client.createdAt', 'DESC');
    
    const query = queryBuilder.getSql();
    const parameters = queryBuilder.getParameters();
    console.log('Generated SQL:', query);
    console.log('Query parameters:', parameters);

    const [clients, total] = await queryBuilder.getManyAndCount();
    console.log(`Found ${clients.length} clients out of ${total} total`);

    return [clients, total];
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.profile'],
    });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }

  async findByIndustry(industry: string): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { industry: Like(`%${industry}%`) },
      order: { companyName: 'ASC' },
    });
  }

  async findActiveClients(): Promise<Client[]> {
    return await this.clientRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async searchByLocation(location: string): Promise<Client[]> {
    const queryBuilder = this.clientRepository.createQueryBuilder('client');
    return await queryBuilder
      .where('client.locations && ARRAY[:location]', { location })
      .orderBy('client.companyName', 'ASC')
      .getMany();
  }
} 