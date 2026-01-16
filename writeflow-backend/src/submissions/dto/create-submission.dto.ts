import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'task-uuid-here' })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ 
    example: 'https://res.cloudinary.com/your-cloud/raw/upload/v1234567890/submissions/document.pdf',
    description: 'Cloudinary URL to the submitted file (uploaded via separate file upload endpoint)'
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional({ 
    example: 'I have completed the research paper with all required citations. Please review and let me know if any revisions are needed.',
    description: 'Optional notes from the writer'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}