import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileNoteDto {
  @ApiProperty({
    description: 'The content of the note',
    example: 'Candidate showed strong problem-solving skills'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'The type of note',
    enum: ['general', 'interview', 'feedback', 'performance'],
    example: 'interview'
  })
  @IsEnum(['general', 'interview', 'feedback', 'performance'])
  type: 'general' | 'interview' | 'feedback' | 'performance';
} 