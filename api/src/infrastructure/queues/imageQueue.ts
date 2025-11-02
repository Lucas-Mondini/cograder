import { Queue } from 'bullmq';
import { redisConnection } from '@/infrastructure/queues/redis-connection';
import { ImageJobPayload } from '@/core/types';

export const imageQueue = new Queue<ImageJobPayload>('image-processing', {
  connection: redisConnection,
});