import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { ParseDatePipe } from '../common/pipes/parse-date.pipe';

@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({ status: 201, description: 'Assignment successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Profile or Client not found' })
  create(@Body(ValidationPipe) createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments with filtering options' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'profileId', required: false, description: 'Filter by profile ID' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID' })
  @ApiResponse({ status: 200, description: 'List of assignments retrieved successfully' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('startDate', new ParseDatePipe()) startDate?: Date,
    @Query('endDate', new ParseDatePipe()) endDate?: Date,
    @Query('profileId', new ParseUUIDPipe({ optional: true })) profileId?: string,
    @Query('clientId', new ParseUUIDPipe({ optional: true })) clientId?: string,
  ) {
    return this.assignmentsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      status,
      startDate,
      endDate,
      profileId,
      clientId,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active assignments' })
  @ApiResponse({ status: 200, description: 'List of active assignments retrieved successfully' })
  findActive() {
    return this.assignmentsService.findActiveAssignments();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get assignments within a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date of the range' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date of the range' })
  @ApiResponse({ status: 200, description: 'List of assignments within date range retrieved successfully' })
  findByDateRange(
    @Query('startDate', ParseDatePipe) startDate: Date,
    @Query('endDate', ParseDatePipe) endDate: Date,
  ) {
    return this.assignmentsService.findAssignmentsByDateRange(startDate, endDate);
  }

  @Get('profile/:profileId')
  @ApiOperation({ summary: 'Get assignments by profile ID' })
  @ApiParam({ name: 'profileId', description: 'Profile ID (UUID)' })
  @ApiResponse({ status: 200, description: 'List of assignments for profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findByProfile(@Param('profileId', ParseUUIDPipe) profileId: string) {
    return this.assignmentsService.findAssignmentsByProfile(profileId);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get assignments by client ID' })
  @ApiParam({ name: 'clientId', description: 'Client ID (UUID)' })
  @ApiResponse({ status: 200, description: 'List of assignments for client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findByClient(@Param('clientId', ParseUUIDPipe) clientId: string) {
    return this.assignmentsService.findAssignmentsByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an assignment by ID' })
  @ApiParam({ name: 'id', description: 'Assignment ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assignmentsService.remove(id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to an assignment' })
  @ApiParam({ name: 'id', description: 'Assignment ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Note successfully added' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) createNoteDto: CreateNoteDto,
  ) {
    return this.assignmentsService.addNote(id, createNoteDto);
  }

  @Delete(':assignmentId/notes/:noteId')
  @ApiOperation({ summary: 'Delete a note from an assignment' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID (UUID)' })
  @ApiParam({ name: 'noteId', description: 'Note ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Note successfully deleted' })
  @ApiResponse({ status: 404, description: 'Assignment or note not found' })
  removeNote(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
  ) {
    return this.assignmentsService.removeNote(assignmentId, noteId);
  }
} 