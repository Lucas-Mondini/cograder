import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { config } from '@config/server';
import { getHttpServer } from '@core/http/server';


let io : Server | null = null;

const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    path: config.socketPath,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getSocketServer = (): Server => {
  if (!io) {
    io = createSocketServer(getHttpServer());
  }
  return io;
}