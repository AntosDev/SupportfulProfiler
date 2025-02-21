import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, ParseUUIDPipe, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileNoteDto } from './dto/create-profile-note.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new profile' })
  @ApiResponse({ status: 201, description: 'Profile successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  create(@Body(ValidationPipe) createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all profiles with filtering options' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term for profile name' })
  @ApiQuery({ name: 'skills', required: false, description: 'Filter by skills', isArray: true })
  @ApiQuery({ name: 'availability', required: false, description: 'Filter by availability' })
  @ApiQuery({ name: 'minExperience', required: false, description: 'Minimum years of experience' })
  @ApiQuery({ name: 'maxExperience', required: false, description: 'Maximum years of experience' })
  @ApiResponse({ status: 200, description: 'List of profiles retrieved successfully' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('skills') skills?: string[],
    @Query('availability') availability?: string,
    @Query('minExperience') minExperience?: number,
    @Query('maxExperience') maxExperience?: number,
  ) {
    return this.profilesService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      searchTerm,
      skills,
      availability,
      minExperience: minExperience ? +minExperience : undefined,
      maxExperience: maxExperience ? +maxExperience : undefined,
    });
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available profiles' })
  @ApiResponse({ status: 200, description: 'List of available profiles retrieved successfully' })
  findAvailable() {
    return this.profilesService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiParam({ name: 'id', description: 'Profile ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiParam({ name: 'id', description: 'Profile ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiParam({ name: 'id', description: 'Profile ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.remove(id);
  }

  @Post('search/skills')
  @ApiOperation({ summary: 'Search profiles by skills' })
  @ApiResponse({ status: 200, description: 'Profiles matching skills retrieved successfully' })
  searchBySkills(@Body('skills', ValidationPipe) skills: string[]) {
    return this.profilesService.searchBySkills(skills);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a profile' })
  @ApiParam({ name: 'id', description: 'Profile ID (UUID)' })
  @ApiResponse({ status: 201, description: 'Note successfully added' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) createNoteDto: CreateProfileNoteDto
  ) {
    return this.profilesService.addNote(id, createNoteDto);
  }

  @Delete(':profileId/notes/:noteId')
  @ApiOperation({ summary: 'Delete a note from a profile' })
  @ApiParam({ name: 'profileId', description: 'Profile ID (UUID)' })
  @ApiParam({ name: 'noteId', description: 'Note ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Note successfully deleted' })
  @ApiResponse({ status: 404, description: 'Profile or note not found' })
  deleteNote(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string
  ) {
    return this.profilesService.deleteNote(profileId, noteId);
  }
} 