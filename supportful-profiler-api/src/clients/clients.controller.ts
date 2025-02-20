import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  create(@Body(ValidationPipe) createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients with filtering options' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term for company name or description' })
  @ApiQuery({ name: 'industry', required: false, description: 'Filter by industry' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  @ApiResponse({ status: 200, description: 'List of clients retrieved successfully' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('industry') industry?: string,
    @Query('status') status?: string,
    @Query('location') location?: string,
  ) {
    return this.clientsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      searchTerm,
      industry,
      status,
      location,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active clients' })
  @ApiResponse({ status: 200, description: 'List of active clients retrieved successfully' })
  findActive() {
    return this.clientsService.findActiveClients();
  }

  @Get('industry/:industry')
  @ApiOperation({ summary: 'Get clients by industry' })
  @ApiParam({ name: 'industry', description: 'Industry name' })
  @ApiResponse({ status: 200, description: 'List of clients in the specified industry retrieved successfully' })
  findByIndustry(@Param('industry') industry: string) {
    return this.clientsService.findByIndustry(industry);
  }

  @Get('location/:location')
  @ApiOperation({ summary: 'Get clients by location' })
  @ApiParam({ name: 'location', description: 'Location name' })
  @ApiResponse({ status: 200, description: 'List of clients in the specified location retrieved successfully' })
  searchByLocation(@Param('location') location: string) {
    return this.clientsService.searchByLocation(location);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', description: 'Client ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiParam({ name: 'id', description: 'Client ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }
} 