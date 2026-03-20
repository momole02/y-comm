import express from 'express';
import { ClientInfo } from './types';
export declare class RestApiService {
    private app;
    constructor();
    private setupMiddleware;
    setupRoutes(clients: Map<string, ClientInfo>, port: number): express.Express;
    getApp(): express.Express;
}
