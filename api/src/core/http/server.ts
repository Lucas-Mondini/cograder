import express, {Express} from 'express';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import cors from 'cors';

let app : Express | null = null;
let httpServer: Server<typeof IncomingMessage, typeof ServerResponse> | null = null;

export const getApp = () : Express => {
    if (!app) {
        app = express();
        app.use(cors());
        app.use(express.json());
    }

    return app;
}

export const getHttpServer = () : Server<typeof IncomingMessage, typeof ServerResponse> => {
    if (!httpServer) {
        httpServer = createServer(getApp());
    }

    return httpServer;
}