import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsBoolean, IsUrl, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'John', description: 'First name of the profile' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the profile' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the profile' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number of the profile' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: ['JavaScript', 'TypeScript', 'Node.js'],
    description: 'List of skills possessed by the profile',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({
    example: 'Experienced full-stack developer with expertise in Node.js and React',
    description: 'Professional summary of the profile',
  })
  @IsString()
  @MaxLength(2000)
  summary: string;

  @ApiProperty({
    example: 5,
    description: 'Years of professional experience',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @IsUrl()
  @IsOptional()
  linkedInUrl?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @ApiPropertyOptional({
    example: 'https://johndoe.com',
    description: 'Personal portfolio URL',
  })
  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Expected hourly rate in USD',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  expectedRate?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the profile is available for new assignments',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    example: ['Remote', 'New York', 'London'],
    description: 'Preferred work locations',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredLocations?: string[];
} 