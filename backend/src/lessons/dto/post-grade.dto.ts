import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { MarkType, WorkType } from '@prisma/client';

export class PostGradeDto {
  @ApiProperty({ example: 'student-uuid', description: 'Student ID' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'lesson-uuid', description: 'Lesson ID' })
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiPropertyOptional({ example: 5, description: 'Grade value (1 to 5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  value?: number;

  @ApiProperty({ example: MarkType.PRESENCE, enum: MarkType, description: 'Mark presence type' })
  @IsEnum(MarkType)
  @IsNotEmpty()
  markType: MarkType;

  @ApiProperty({ example: WorkType.PRACTICE, enum: WorkType, description: 'Work type' })
  @IsEnum(WorkType)
  @IsNotEmpty()
  type: WorkType;

  @ApiPropertyOptional({ example: 'Отличный ответ на семинаре', description: 'Optional teacher comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}
