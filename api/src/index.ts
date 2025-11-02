import dotenv from 'dotenv';
import { config } from './config/server';
import { redisConnection } from './infrastructure/queues/redis-connection';
import { createImageWorker } from './infrastructure/workers/imageWorker';
import { createRoutes } from './app/routes';
import { getApp, getHttpServer } from './core/http/server';

dotenv.config();
const app = getApp();
const httpServer = getHttpServer();
const worker = createImageWorker();

app.use(createRoutes());

httpServer.listen(config.port, () => {
  console.log(`🚀 Server Running on port: ${config.port}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await worker.close();
  await redisConnection.quit();
  httpServer.close();
  process.exit(0);
});