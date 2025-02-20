import { IsString, IsEmail, IsOptional, IsArray, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Name of the company',
  })
  @IsString()
  @MaxLength(200)
  companyName: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Industry sector of the company',
  })
  @IsString()
  @MaxLength(100)
  industry: string;

  @ApiPropertyOptional({
    example: 'https://acme.com',
    description: 'Company website URL',
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    example: 'Leading provider of innovative software solutions',
    description: 'Detailed description of the company',
  })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Jane Smith',
    description: 'Name of the primary contact person',
  })
  @IsString()
  @MaxLength(100)
  primaryContactName: string;

  @ApiProperty({
    example: 'jane.smith@acme.com',
    description: 'Email of the primary contact person',
  })
  @IsEmail()
  primaryContactEmail: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number of the primary contact person',
  })
  @IsString()
  @IsOptional()
  primaryContactPhone?: string;

  @ApiPropertyOptional({
    example: ['New York', 'London', 'Remote'],
    description: 'List of company locations or work locations',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locations?: string[];

  @ApiPropertyOptional({
    example: 'active',
    description: 'Current status of the client',
    default: 'active',
    enum: ['active', 'inactive', 'pending'],
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  status?: string = 'active';

  @ApiPropertyOptional({
    example: {
      techStack: ['Node.js', 'React'],
      teamSize: 5,
      projectDuration: '6 months',
    },
    description: 'Specific requirements for talent',
  })
  @IsOptional()
  requirements?: Record<string, any>;

  @ApiPropertyOptional({
    example: {
      billingCycle: 'monthly',
      preferredCommunication: 'email',
    },
    description: 'Additional information about the client',
  })
  @IsOptional()
  additionalInfo?: Record<string, any>;
} 