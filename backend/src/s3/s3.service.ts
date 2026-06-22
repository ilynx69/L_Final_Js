import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;

  onModuleInit() {
    this.endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY || 'minioadmin';
    const secretAccessKey = process.env.S3_SECRET_KEY || 'minioadminpassword';
    this.bucketName = process.env.S3_BUCKET_NAME || 'gradebook-files';

    this.logger.log(`Initializing S3 client with endpoint: ${this.endpoint}, region: ${region}`);

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    // Try to ensure bucket exists
    this.ensureBucketExists().catch((err) => {
      this.logger.warn(`Could not ensure S3 bucket exists: ${err.message}`);
    });
  }

  private async ensureBucketExists() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`S3 Bucket "${this.bucketName}" already exists.`);
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        this.logger.log(`S3 Bucket "${this.bucketName}" not found. Creating bucket...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.logger.log(`S3 Bucket "${this.bucketName}" created successfully.`);
        } catch (createErr: any) {
          this.logger.error(`Failed to create S3 bucket: ${createErr.message}`);
        }
      } else {
        this.logger.error(`Error checking S3 bucket: ${err.message}`);
      }
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const key = `${folder}/${uniqueId}.${fileExtension}`;

    this.logger.log(`Uploading file ${file.originalname} as ${key} to bucket ${this.bucketName}`);

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Return the URL to access the file
    // e.g. http://localhost:9000/gradebook-files/labs/123-456.pdf
    return `${this.endpoint}/${this.bucketName}/${key}`;
  }
}
