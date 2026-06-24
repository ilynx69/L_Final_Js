import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ example: 'student-uuid', description: 'User ID of the student to add' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
