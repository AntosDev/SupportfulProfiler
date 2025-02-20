import { IsString, IsOptional, IsNumber, IsUUID, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the profile to be assigned',
  })
  @IsUUID()
  profileId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'UUID of the client requesting the assignment',
  })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({
    example: '2024-03-01',
    description: 'Start date of the assignment',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2024-09-01',
    description: 'End date of the assignment',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({
    example: 'pending',
    description: 'Current status of the assignment',
    default: 'pending',
    enum: ['pending', 'active', 'completed', 'cancelled'],
  })
  @IsString()
  @IsOptional()
  status?: string = 'pending';

  @ApiPropertyOptional({
    example: 100,
    description: 'Hourly rate for the assignment in USD',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({
    example: 'Full-stack development role focusing on Node.js and React',
    description: 'Additional notes about the assignment',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: {
      performance: 'excellent',
      communication: 'good',
      technicalSkills: 'outstanding',
    },
    description: 'Feedback on the assignment',
  })
  @IsOptional()
  feedback?: Record<string, any>;

  @ApiPropertyOptional({
    example: {
      workSchedule: '9 AM - 5 PM EST',
      communicationChannel: 'Slack',
    },
    description: 'Additional information about the assignment',
  })
  @IsOptional()
  additionalInfo?: Record<string, any>;
} 