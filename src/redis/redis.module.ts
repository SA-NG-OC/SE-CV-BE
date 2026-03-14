import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisURL = configService.get<string>('REDIS_URL')!
                if (!redisURL) {
                    throw new Error('REDIS_URL is not defined in environment variables');
                }
                const redis = new Redis(redisURL, {
                    maxRetriesPerRequest: 3,
                    retryStrategy: (times) => {
                        if (times > 5) {
                            console.error('Redis: max retries reached');
                            return null;
                        }
                        return Math.min(times * 200, 2000);
                    },
                    enableOfflineQueue: false,
                    commandTimeout: 3000,
                    lazyConnect: false
                })
                redis.on('connect', () => console.log('Redis đã kết nối thành công'));
                redis.on('error', (err) => console.error('Redis error:', err));
                redis.on('close', () => console.warn('Redis connection closed'));
                return redis;
            }
        }
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }