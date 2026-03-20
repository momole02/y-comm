import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { RestApiService } from './rest-api-service.js';
export class WebSocketServerManager {
    wss;
    clients = new Map();
    port;
    constructor(endpoint = { port: 3000 }) {
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
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            const clientInfo = {
                id: clientId,
                ws,
                lastPing: Date.now()
            };
            this.handleClientConnection(clientInfo);
            // Gérer les messages du client
            ws.on('message', (data) => {
                this.handleClientMessageData(clientInfo, data, clientId);
            });
            // Gérer la déconnexion
            ws.on('close', (code, reason) => {
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
    handleClientConnection(clientInfo) {
        this.clients.set(clientInfo.id, clientInfo);
        console.log(`👤 Client connecté: ${clientInfo.id} (${this.clients.size} clients total)`);
        // Envoyer un message de bienvenue avec l'identifiant client
        this.sendToClient(clientInfo, {
            type: 'welcome',
            clientId: clientInfo.id,
            message: `Bienvenue! Votre identifiant est ${clientInfo.id}`,
            timestamp: Date.now()
        });
    }
    handleClientMessageData(clientInfo, data, clientId) {
        try {
            const message = JSON.parse(data.toString());
            this.handleClientMessage(clientInfo, message);
        }
        catch (error) {
            console.error(`❌ Erreur parsing message de ${clientId}:`, error);
            this.sendToClient(clientInfo, {
                type: 'error',
                message: 'Message invalide',
                timestamp: Date.now()
            });
        }
    }
    handleClientDisconnection(clientId, code) {
        this.clients.delete(clientId);
        console.log(`👋 Client déconnecté: ${clientId} (code: ${code}) (${this.clients.size} clients restants)`);
        // Notifier les autres clients
        this.broadcast({
            type: 'client_disconnected',
            clientId,
            timestamp: Date.now()
        }, clientId);
    }
    handleClientMessage(client, message) {
        console.log(`📨 Message de ${client.id}:`, message.type);
        switch (message.type) {
            case 'ping':
                this.sendToClient(client, {
                    type: 'pong',
                    timestamp: Date.now()
                });
                break;
            case 'chat':
                this.broadcast({
                    type: 'chat',
                    clientId: client.id,
                    message: message.message,
                    timestamp: Date.now()
                }, client.id);
                break;
            case 'private_message':
                const targetClient = this.clients.get(message.targetClientId);
                if (targetClient) {
                    this.sendToClient(targetClient, {
                        type: 'private_message',
                        fromClientId: client.id,
                        message: message.message,
                        timestamp: Date.now()
                    });
                }
                else {
                    this.sendToClient(client, {
                        type: 'error',
                        message: 'Client destinataire introuvable',
                        timestamp: Date.now()
                    });
                }
                break;
            default:
                this.sendToClient(client, {
                    type: 'error',
                    message: 'Type de message non supporté',
                    timestamp: Date.now()
                });
        }
    }
    sendToClient(client, message) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    broadcast(message, excludeClientId) {
        this.clients.forEach((client, clientId) => {
            if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        });
    }
    cleanupInactiveClients() {
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
    generateClientId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    // Méthodes publiques pour l'administration
    getClientsCount() {
        return this.clients.size;
    }
    broadcastToAll(message) {
        this.broadcast(message);
    }
}
