import { ClientInfo, ClientMessage, ServerMessage } from './types.js';
export declare class WebSocketServerManager {
    private wss;
    private clients;
    private port;
    constructor(endpoint?: {
        port: number;
        host?: string;
    });
    private setupWebSocketHandlers;
    protected handleClientConnection(clientInfo: ClientInfo): void;
    protected handleClientMessageData(clientInfo: ClientInfo, data: Buffer, clientId: string): void;
    protected handleClientDisconnection(clientId: string, code: number): void;
    protected handleClientMessage(client: ClientInfo, message: ClientMessage): void;
    private sendToClient;
    private broadcast;
    private cleanupInactiveClients;
    private generateClientId;
    getClientsCount(): number;
    broadcastToAll(message: ServerMessage): void;
}
