import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.logger.log(`Connecting to Redis at ${host}:${port}...`);
    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully!');
    });

    // Connect asynchronously to avoid blocking NestJS startup if Redis is down
    this.client.connect().catch((err) => {
      this.logger.error(`Failed to connect to Redis: ${err.message}`);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.client.status !== 'ready') return null;
      return await this.client.get(key);
    } catch (err) {
      this.logger.error(`Error in Redis get(${key}): ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (this.client.status !== 'ready') return;
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.error(`Error in Redis set(${key}): ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client.status !== 'ready') return;
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Error in Redis del(${key}): ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
