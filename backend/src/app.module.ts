import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { S3Module } from './s3/s3.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LessonsModule } from './lessons/lessons.module';
import { ScheduleModule } from './schedule/schedule.module';
import { JournalModule } from './journal/journal.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    S3Module,
    UsersModule,
    AuthModule,
    LessonsModule,
    ScheduleModule,
    JournalModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
