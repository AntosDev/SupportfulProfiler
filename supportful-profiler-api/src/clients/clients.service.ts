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
    const { skip = 0, take = 10, searchTerm, industry, status, location } = params;
    
    const queryBuilder = this.clientRepository.createQueryBuilder('client');
    queryBuilder.skip(skip).take(take);

    if (searchTerm) {
      queryBuilder.where(
        '(LOWER(client.companyName) LIKE LOWER(:searchTerm) OR LOWER(client.description) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${searchTerm}%` }
      );
    }

    if (industry) {
      queryBuilder.andWhere('LOWER(client.industry) LIKE LOWER(:industry)', { industry: `%${industry}%` });
    }

    if (status) {
      queryBuilder.andWhere('client.status = :status', { status });
    }

    if (location) {
      queryBuilder.andWhere('client.locations && ARRAY[:location]', { location });
    }

    queryBuilder.orderBy('client.createdAt', 'DESC');

    return await queryBuilder.getManyAndCount();
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