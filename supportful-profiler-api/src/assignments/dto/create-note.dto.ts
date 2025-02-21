import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type NoteType = 'general' | 'interview' | 'feedback' | 'performance' | 'issue';

export class CreateNoteDto {
  @ApiProperty({
    example: 'Client feedback from the latest meeting',
    description: 'Content of the note',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'feedback',
    description: 'Type of the note',
    enum: ['general', 'interview', 'feedback', 'performance', 'issue'],
  })
  @IsEnum(['general', 'interview', 'feedback', 'performance', 'issue'] as const)
  type: NoteType;
} 