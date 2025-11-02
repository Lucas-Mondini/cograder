// infrastructure/workers/imageWorker.ts
import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/infrastructure/queues/redis-connection';
import { ImageJobPayload, JobDocument, ImageJobResult } from '@core/types';
import { firestore, storage } from '@infrastructure/database/firebase';
import { downloadImage, processImage, uploadToStorage } from '@app/services/image-processor';

export const createImageWorker = (): Worker<ImageJobPayload, ImageJobResult> => {
  const worker = new Worker<ImageJobPayload, ImageJobResult>(
    'image-processing',
    async (job: Job<ImageJobPayload>) => {
      const jobRef = firestore.collection('jobs').doc(job.id!) as FirebaseFirestore.DocumentReference<JobDocument>;

      try {
        console.log(`Processing job ${job.id}:`, job.data);

        await jobRef.update({ status: 'processing', progress: 20 });
        const imageBuffer = await downloadImage(job.data.url);
        console.log(`Downloaded image from: ${job.data.url}`);

        await jobRef.update({ progress: 50 });
        const processedBuffer = await processImage(imageBuffer, job.data.transformations);
        console.log(`Applied ${job.data.transformations.length} transformation(s)`);

        await jobRef.update({ progress: 80 });
        const resultUrl = await uploadToStorage(processedBuffer, job.id!, storage);
        console.log(`Uploaded to: ${resultUrl}`);

        // 4. Complete
        await jobRef.update({
          status: 'completed',
          progress: 100,
          resultUrl,
          processedAt: new Date().toISOString()
        });

        return {
          status: 'completed',
          resultUrl,
          processedAt: new Date().toISOString()
        };
      } catch (error: any) {
        console.error(`Job ${job.id} failed:`, error.message);
        await jobRef.update({
          status: 'failed',
          error: error.message,
          progress: 0,
        });
        throw error;
      }
    },
    {
      connection: redisConnection,
    }
  );

  worker.on('completed', (job: Job<ImageJobPayload, ImageJobResult>) => {
    console.log(`✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`✗ Job ${job?.id} failed:`, err.message);
  });

  return worker;
};