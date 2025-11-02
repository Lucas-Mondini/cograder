// redis-connection.ts
import Redis from 'ioredis';

const MAX_RETRIES = Number(process.env.REDIS_MAX_RETRIES) || 10;

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > MAX_RETRIES) {
      console.error(`Redis: Max retries (${MAX_RETRIES}) reached. Giving up.`);
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  console.log('Redis connected');
});