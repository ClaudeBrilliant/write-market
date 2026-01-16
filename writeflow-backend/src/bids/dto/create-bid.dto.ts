import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ example: 'task-uuid-here' })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ example: 120.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'I have 5 years of experience in this field...' })
  @IsString()
  @IsNotEmpty()
  proposal: string;
}