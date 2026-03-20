import express from 'express';
export class RestApiService {
    app;
    constructor() {
        this.app = express();
        this.setupMiddleware();
    }
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }
    setupRoutes(clients, port) {
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
    getApp() {
        return this.app;
    }
}
