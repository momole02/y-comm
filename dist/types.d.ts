import { WebSocket } from 'ws';
export interface ClientInfo {
    id: string;
    ws: WebSocket;
    lastPing: number;
}
export interface BaseMessage {
    type: string;
    timestamp: number;
}
export interface PingMessage extends BaseMessage {
    type: 'ping';
}
export interface PongMessage extends BaseMessage {
    type: 'pong';
}
export interface ChatMessage extends BaseMessage {
    type: 'chat';
    clientId: string;
    message: string;
}
export interface PrivateMessage extends BaseMessage {
    type: 'private_message';
    targetClientId: string;
    message: string;
}
export interface PrivateMessageReceived extends BaseMessage {
    type: 'private_message';
    fromClientId: string;
    message: string;
}
export interface ErrorMessage extends BaseMessage {
    type: 'error';
    message: string;
}
export interface WelcomeMessage extends BaseMessage {
    type: 'welcome';
    clientId: string;
    message: string;
}
export interface ClientDisconnectedMessage extends BaseMessage {
    type: 'client_disconnected';
    clientId: string;
}
export type ClientMessage = PingMessage | ChatMessage | PrivateMessage;
export type ServerMessage = WelcomeMessage | PongMessage | ChatMessage | PrivateMessageReceived | ErrorMessage | ClientDisconnectedMessage;
