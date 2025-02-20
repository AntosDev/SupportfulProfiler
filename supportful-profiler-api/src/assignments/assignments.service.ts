import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { ProfilesService } from '../profiles/profiles.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    private readonly profilesService: ProfilesService,
    private readonly clientsService: ClientsService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { profileId, clientId, ...rest } = createAssignmentDto;

    // Verify that profile and client exist
    const profile = await this.profilesService.findOne(profileId);
    const client = await this.clientsService.findOne(clientId);

    const assignment = this.assignmentRepository.create({
      profile,
      client,
      ...rest,
    });

    return await this.assignmentRepository.save(assignment);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    profileId?: string;
    clientId?: string;
  }): Promise<Assignment[]> {
    const { skip = 0, take = 10, status, startDate, endDate, profileId, clientId } = params;

    const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment');
    queryBuilder
      .leftJoinAndSelect('assignment.profile', 'profile')
      .leftJoinAndSelect('assignment.client', 'client')
      .skip(skip)
      .take(take);

    if (status) {
      queryBuilder.andWhere('assignment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('assignment.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('assignment.startDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('assignment.endDate <= :endDate', { endDate });
    }

    if (profileId) {
      queryBuilder.andWhere('profile.id = :profileId', { profileId });
    }

    if (clientId) {
      queryBuilder.andWhere('client.id = :clientId', { clientId });
    }

    queryBuilder.orderBy('assignment.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['profile', 'client'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id);
    const { profileId, clientId, ...rest } = updateAssignmentDto;

    if (profileId) {
      assignment.profile = await this.profilesService.findOne(profileId);
    }

    if (clientId) {
      assignment.client = await this.clientsService.findOne(clientId);
    }

    Object.assign(assignment, rest);
    return await this.assignmentRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.assignmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
  }

  async findActiveAssignments(): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: { status: 'active' },
      relations: ['profile', 'client'],
      order: { startDate: 'DESC' },
    });
  }

  async findAssignmentsByDateRange(startDate: Date, endDate: Date): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: [
        { startDate: Between(startDate, endDate) },
        { endDate: Between(startDate, endDate) },
        {
          startDate: LessThanOrEqual(startDate),
          endDate: MoreThanOrEqual(endDate),
        },
      ],
      relations: ['profile', 'client'],
      order: { startDate: 'ASC' },
    });
  }

  async findAssignmentsByProfile(profileId: string): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: { profile: { id: profileId } },
      relations: ['profile', 'client'],
      order: { startDate: 'DESC' },
    });
  }

  async findAssignmentsByClient(clientId: string): Promise<Assignment[]> {
    return await this.assignmentRepository.find({
      where: { client: { id: clientId } },
      relations: ['profile', 'client'],
      order: { startDate: 'DESC' },
    });
  }
} 