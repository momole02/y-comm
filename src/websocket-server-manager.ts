import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { RestApiService } from './rest-api-service.js';
import { generateClientId } from './utils.js';
import {
  ClientInfo,
  ClientMessage,
  ServerMessage,
  ErrorMessage,
  PongMessage,
  ChatMessage,
  PrivateMessageReceived,
  ClientDisconnectedMessage,
  WelcomeMessage
} from './types.js';

export class WebSocketServerManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientInfo> = new Map();
  private port: number;

  constructor(endpoint: { port: number; host?: string } = { port: 3000 }) {
    this.port = endpoint.port;
    const restApiService = new RestApiService();
    const app = restApiService.setupRoutes(this.clients, this.port);
    const server = createServer(app);

    // Configuration WebSocket
    this.wss = new WebSocketServer({
      server,
      path: '/ws'
    });

    this.setupWebSocketHandlers();

    server.listen(this.port, () => {
      console.log(`🚀 Serveur WebSocket démarré sur le port ${this.port}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${this.port}/ws`);
      console.log(`🌐 HTTP endpoint: http://localhost:${this.port}`);
    });
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      const clientInfo: ClientInfo = {
        id: clientId,
        ws,
        lastPing: Date.now()
      };

      this.handleClientConnection(clientInfo);

      // Gérer les messages du client
      ws.on('message', (data: Buffer) => {
        this.handleClientMessageData(clientInfo, data, clientId);
      });

      // Gérer la déconnexion
      ws.on('close', (code: number, reason: Buffer) => {
        console.log(`📋 Raison déconnexion ${clientId}:`, reason.toString());
        this.handleClientDisconnection(clientId, code);
      });

      // Gérer les erreurs
      ws.on('error', (error) => {
        console.error(`❌ Erreur WebSocket client ${clientId}:`, error);
      });

      // Ping/Pong pour maintenir la connexion
      ws.on('pong', () => {
        clientInfo.lastPing = Date.now();
      });
    });

    // Nettoyage périodique des connexions inactives
    setInterval(() => {
      this.cleanupInactiveClients();
    }, 30000); // 30 secondes
  }

  protected handleClientConnection(clientInfo: ClientInfo): void {
    this.clients.set(clientInfo.id, clientInfo);
    console.log(`👤 Client connecté: ${clientInfo.id} (${this.clients.size} clients total)`);

    // Envoyer un message de bienvenue avec l'identifiant client
    this.sendToClient(clientInfo, {
      type: 'welcome',
      clientId: clientInfo.id,
      message: `Bienvenue! Votre identifiant est ${clientInfo.id}`,
      timestamp: Date.now()
    } as WelcomeMessage);
  }

  protected handleClientMessageData(clientInfo: ClientInfo, data: Buffer, clientId: string): void {
    try {
      const message = JSON.parse(data.toString());
      this.handleClientMessage(clientInfo, message);
    } catch (error) {
      console.error(`❌ Erreur parsing message de ${clientId}:`, error);
      this.sendToClient(clientInfo, {
        type: 'error',
        message: 'Message invalide',
        timestamp: Date.now()
      } as ErrorMessage);
    }
  }

  protected handleClientDisconnection(clientId: string, code: number): void {
    this.clients.delete(clientId);
    console.log(`👋 Client déconnecté: ${clientId} (code: ${code}) (${this.clients.size} clients restants)`);

    // Notifier les autres clients
    this.broadcast({
      type: 'client_disconnected',
      clientId,
      timestamp: Date.now()
    } as ClientDisconnectedMessage, clientId);
  }

  protected handleClientMessage(client: ClientInfo, message: ClientMessage): void {
    console.log(`📨 Message de ${client.id}:`, message.type);

    switch (message.type) {
      case 'ping':
        this.sendToClient(client, {
          type: 'pong',
          timestamp: Date.now()
        } as PongMessage);
        break;

      case 'chat':
        this.broadcast({
          type: 'chat',
          clientId: client.id,
          message: message.message,
          timestamp: Date.now()
        } as ChatMessage, client.id);
        break;

      case 'private_message':
        const targetClient = this.clients.get(message.targetClientId);
        if (targetClient) {
          this.sendToClient(targetClient, {
            type: 'private_message',
            fromClientId: client.id,
            message: message.message,
            timestamp: Date.now()
          } as PrivateMessageReceived);
        } else {
          this.sendToClient(client, {
            type: 'error',
            message: 'Client destinataire introuvable',
            timestamp: Date.now()
          } as ErrorMessage);
        }
        break;

      default:
        this.sendToClient(client, {
          type: 'error',
          message: 'Type de message non supporté',
          timestamp: Date.now()
        } as ErrorMessage);
    }
  }

  private sendToClient(client: ClientInfo, message: ServerMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: ServerMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  private cleanupInactiveClients(): void {
    const now = Date.now();
    const timeout = 60000; // 60 secondes

    this.clients.forEach((client, clientId) => {
      if (now - client.lastPing > timeout) {
        console.log(`🧹 Nettoyage client inactif: ${clientId}`);
        client.ws.terminate();
        this.clients.delete(clientId);
      }
    });
  }

  private generateClientId(): string {
    return generateClientId();
  }

  // Méthodes publiques pour l'administration
  public getClientsCount(): number {
    return this.clients.size;
  }

  public broadcastToAll(message: ServerMessage): void {
    this.broadcast(message);
  }
}
