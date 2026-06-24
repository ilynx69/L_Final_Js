import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'assignment-uuid', description: 'Lab Assignment ID' })
  @IsString()
  @IsNotEmpty()
  labAssignmentId: string;

  @ApiProperty({ example: 'Команда Мечты', description: 'Project team name' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
