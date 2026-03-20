import express from 'express';
import { ClientInfo } from './types';

export class RestApiService {
  private app: express.Express;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  public setupRoutes(clients: Map<string, ClientInfo>, port: number): express.Express {
    // Routes REST API
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        clients: clients.size,
        port: port
      });
    });

    this.app.get('/api/clients', (req, res) => {
      const clientList = Array.from(clients.values()).map(client => ({
        id: client.id,
        lastPing: client.lastPing
      }));
      res.json(clientList);
    });

    return this.app;
  }

  public getApp(): express.Express {
    return this.app;
  }
}
