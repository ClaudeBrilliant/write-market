import { IsOptional, IsDateString } from 'class-validator';

export class StatisticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}