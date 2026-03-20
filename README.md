# Serveur WebSocket avec Express et TypeScript

Serveur WebSocket moderne utilisant Express, TypeScript et Node.js 23 avec support natif TypeScript.

## 🚀 Fonctionnalités

- **WebSocket Server**: Serveur WebSocket complet avec gestion des connexions
- **Express HTTP**: Serveur HTTP intégré pour les API REST
- **TypeScript**: Support TypeScript natif avec Node.js 23
- **Gestion des clients**: Suivi des clients connectés avec nettoyage automatique
- **Messages**: Support des messages broadcast, privés et système
- **Ping/Pong**: Maintien des connexions avec heartbeat
- **Interface web**: Client WebSocket de test dans le navigateur
- **API REST**: Endpoints pour vérifier le statut du serveur

## 📋 Prérequis

- Node.js 23 ou supérieur (pour le support natif TypeScript)
- pnpm (package manager)

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd y-comm

# Installer les dépendances
pnpm install
```

## 🏃‍♂️ Démarrage

### Développement (avec TypeScript natif)

```bash
pnpm dev
```

### Production

```bash
# Compiler TypeScript
pnpm build

# Démarrer le serveur compilé
pnpm start
```

Le serveur démarrera sur:
- **WebSocket**: `ws://localhost:3000/ws`
- **HTTP**: `http://localhost:3000`
- **Client test**: `http://localhost:3000`

## 📡 API WebSocket

### Types de messages

#### Client → Serveur

```typescript
// Message de chat (broadcast)
{
  type: "chat",
  message: "Hello world!"
}

// Message privé
{
  type: "private_message",
  targetClientId: "abc123",
  message: "Message privé"
}

// Ping
{
  type: "ping"
}
```

#### Serveur → Client

```typescript
// Message de bienvenue
{
  type: "welcome",
  clientId: "abc123",
  message: "Bienvenue sur le serveur!",
  timestamp: 1640995200000
}

// Message de chat broadcast
{
  type: "chat",
  clientId: "def456",
  message: "Hello world!",
  timestamp: 1640995200000
}

// Message privé reçu
{
  type: "private_message",
  fromClientId: "def456",
  message: "Message privé",
  timestamp: 1640995200000
}

// Notification de déconnexion
{
  type: "client_disconnected",
  clientId: "def456",
  timestamp: 1640995200000
}

// Réponse ping
{
  type: "pong",
  timestamp: 1640995200000
}

// Erreur
{
  type: "error",
  message: "Message invalide",
  timestamp: 1640995200000
}
```

## 🌐 API REST

### GET `/api/status`

Retourne le statut du serveur:

```json
{
  "status": "running",
  "clients": 3,
  "port": 3000
}
```

### GET `/api/clients`

Retourne la liste des clients connectés:

```json
[
  {
    "id": "abc123",
    "lastPing": 1640995200000
  },
  {
    "id": "def456",
    "lastPing": 1640995250000
  }
]
```

## 🧪 Client Test

Ouvrez `http://localhost:3000` dans votre navigateur pour accéder à l'interface de test WebSocket qui permet de:

- Voir le statut de connexion en temps réel
- Envoyer des messages de chat (broadcast)
- Envoyer des messages privés à des clients spécifiques
- Tester le ping/pong
- Voir l'historique des messages
- Obtenir votre ID client

## 🏗️ Architecture

```
y-comm/
├── server.ts              # Serveur principal WebSocket + Express
├── public/
│   └── index.html         # Client WebSocket de test
├── package.json           # Configuration du projet
├── tsconfig.json          # Configuration TypeScript
└── README.md              # Documentation
```

## 🔧 Configuration

### Port par défaut

Le serveur utilise le port 3000 par défaut. Pour le modifier:

```typescript
// Dans server.ts
const server = new WebSocketServerManager(8080); // Port 8080
```

### Configuration TypeScript

Le projet est configuré pour Node.js 23 avec support TypeScript natif:

- **Target**: ES2022
- **Module**: ESNext
- **Module Resolution**: Bundler
- **Type Checking**: Strict activé

## 🔄 Scripts disponibles

```bash
pnpm dev        # Démarrage en développement (TypeScript natif)
pnpm build      # Compilation TypeScript vers JavaScript
pnpm start      # Démarrage du serveur compilé
pnpm clean      # Nettoyage du dossier dist/
```

## 🛡️ Sécurité

- Nettoyage automatique des connexions inactives (60 secondes)
- Validation des messages JSON
- Gestion des erreurs WebSocket
- Arrêt propre du serveur (SIGINT/SIGTERM)

## 🐳 Déploiement Docker

Pour déployer l'application avec Docker, consultez la documentation complète: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

### Démarrage rapide

```bash
# Développement
make up

# Production
make deploy-prod
```

### Commandes Docker utiles

- `make build` - Construire l'image Docker
- `make up` - Démarrer en mode développement  
- `make down` - Arrêter les services
- `make logs` - Voir les logs
- `make status` - Vérifier le statut

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🐛 Dépannage

### Erreur "Unsupported engine"

L'avertissement concernant Node.js 23 peut être ignoré si vous utilisez une version inférieure. Le serveur fonctionnera correctement avec Node.js 20+.

### Problèmes de connexion

- Vérifiez que le port 3000 n'est pas utilisé par une autre application
- Assurez-vous qu'aucun firewall ne bloque les connexions WebSocket
- Vérifiez la console du navigateur pour les erreurs JavaScript

### TypeScript ne compile pas

- Vérifiez que `tsconfig.json` est correctement configuré
- Assurez-vous que toutes les dépendances sont installées avec `pnpm install`
