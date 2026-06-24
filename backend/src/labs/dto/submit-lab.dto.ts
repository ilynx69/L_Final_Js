import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class SubmitLabDto {
  @ApiProperty({ example: 'assignment-uuid', description: 'Lab Assignment ID' })
  @IsString()
  @IsNotEmpty()
  labAssignmentId: string;

  @ApiPropertyOptional({ example: 'team-uuid', description: 'Team ID (required if team assignment)' })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ example: 'http://localhost:9000/gradebook-files/labs/submission_file.zip', description: 'File URL in S3' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
