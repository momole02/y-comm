import { WebSocketServerManager } from './websocket-server-manager.js';
// Démarrage du serveur
const server = new WebSocketServerManager({ port: 3000 });
// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    process.exit(0);
});
