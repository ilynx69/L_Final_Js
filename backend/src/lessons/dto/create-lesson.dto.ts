import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsISO8601 } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'subject-uuid', description: 'Subject ID' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'group-uuid', description: 'Group ID' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: '2026-06-24', description: 'Lesson date (YYYY-MM-DD)' })
  @IsISO8601()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '2026-06-24T09:00:00.000Z', description: 'Lesson start time (ISO String)' })
  @IsISO8601()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-06-24T10:30:00.000Z', description: 'Lesson end time (ISO String)' })
  @IsISO8601()
  @IsNotEmpty()
  endTime: string;
}
