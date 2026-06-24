import { Controller, Post, UseInterceptors, UploadedFile, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to S3 storage' })
  @ApiQuery({ name: 'folder', example: 'labs', required: false, description: 'S3 Folder path' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully, returns download/view URL' })
  @ApiResponse({ status: 400, description: 'No file uploaded' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'general',
  ) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }
    const fileUrl = await this.s3Service.uploadFile(file, folder);
    return {
      success: true,
      fileUrl,
    };
  }
}
