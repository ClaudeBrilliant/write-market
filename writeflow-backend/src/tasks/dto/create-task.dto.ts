import { IsString, IsNotEmpty, IsInt, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Research Paper on Climate Change' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Detailed research paper with citations...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Environmental Science' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  pages: number;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  deadline: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(1)
  budget: number;
}