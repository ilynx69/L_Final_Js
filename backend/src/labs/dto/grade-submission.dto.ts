import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ example: 5, description: 'Grade value' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  grade: number;

  @ApiPropertyOptional({ example: 'Работа выполнена аккуратно, отчет полный', description: 'Optional feedback' })
  @IsOptional()
  @IsString()
  comment?: string;
}
