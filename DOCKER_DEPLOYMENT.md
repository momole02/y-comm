# Documentation de Déploiement Docker pour Y-Comm WebSocket Server

## Vue d'ensemble

Y-Comm est un serveur WebSocket avec API REST construit avec Node.js, Express et TypeScript. Cette documentation explique comment déployer l'application en utilisant Docker et Docker Compose.

## Architecture

- **WebSocket Server**: Serveur principal sur le port 3000
- **REST API**: Endpoints pour le statut et la gestion des clients
- **Client Web**: Interface HTML/JavaScript pour tester les WebSocket
- **Nginx** (optionnel): Reverse proxy pour la production

## Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- pnpm (installé localement pour le développement)

## Fichiers Docker

### Dockerfile
- Base: `node:23-alpine`
- Build: Compilation TypeScript vers JavaScript
- Sécurité: Utilisateur non-root (nodejs:1001)
- Port: 3000

### docker-compose.yml
- Service principal: `y-comm-server`
- Service optionnel: `nginx` (reverse proxy)
- Network: `y-comm-network`
- Health check intégré

## Déploiement

### 1. Déploiement Simple (Développement/Test)

```bash
# Construire et démarrer le conteneur
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f y-comm-server
```

L'application sera accessible sur:
- WebSocket: `ws://localhost:3000/ws`
- HTTP API: `http://localhost:3000/api/status`
- Client Web: `http://localhost:3000`

### 2. Déploiement Production avec Nginx

```bash
# Démarrer avec le profil production (inclut Nginx)
docker-compose --profile production up -d
```

L'application sera accessible sur:
- WebSocket: `ws://localhost/ws` (via Nginx)
- HTTP API: `http://localhost/api/status`
- Client Web: `http://localhost`

### 3. Configuration HTTPS (Production)

1. Créer un dossier `ssl/` à la racine
2. Ajouter vos certificats:
   - `ssl/cert.pem` (certificat SSL)
   - `ssl/key.pem` (clé privée)

3. Décommenter la redirection HTTPS dans `nginx.conf`

```bash
# Démarrer avec HTTPS
docker-compose --profile production up -d
```

## Commandes Utiles

### Gestion des Conteneurs

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Reconstruire l'image
docker-compose build --no-cache

# Redémarrer un service spécifique
docker-compose restart y-comm-server

# Exécuter des commandes dans le conteneur
docker-compose exec y-comm-server sh
```

### Monitoring

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Voir les ressources utilisées
docker stats

# Vérifier le health check
docker-compose exec y-comm-server wget -qO- http://localhost:3000/api/status
```

### Nettoyage

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer les images non utilisées
docker image prune -f

# Nettoyage complet (conteneurs, réseaux, volumes)
docker-compose down --volumes --remove-orphans
```

## Configuration

### Variables d'Environnement

Les variables peuvent être configurées dans `docker-compose.yml` ou via un fichier `.env`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - LOG_LEVEL=info
```

### Ports

- **3000**: Port interne du serveur WebSocket
- **80**: Port externe (Nginx HTTP)
- **443**: Port externe (Nginx HTTPS)

### Volumes

Pour la persistance des données (si nécessaire):

```yaml
volumes:
  - ./logs:/app/logs
  - ./data:/app/data
```

## Sécurité

### Bonnes Pratiques Implémentées

1. **Utilisateur non-root**: Le conteneur s'exécute avec l'utilisateur `nodejs:1001`
2. **Image Alpine**: Base minimale pour réduire la surface d'attaque
3. **Health Checks**: Surveillance de l'état du service
4. **Network Isolation**: Utilisation d'un réseau Docker dédié

### Recommandations Additionnelles

1. **Scanner de vulnérabilités**:
   ```bash
   docker scan y-comm-websocket-server
   ```

2. **Limites de ressources**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

3. **Secrets Docker** pour les données sensibles:
   ```bash
   echo "votre_secret" | docker secret create app_secret -
   ```

## Monitoring et Logs

### Logs Structurés

L'application utilise des logs avec émojis pour faciliter l'identification:
- 🚀 Démarrage du serveur
- 👤 Connexion client
- 📨 Messages reçus
- ❌ Erreurs
- 🧹 Nettoyage

### Endpoints de Monitoring

- `GET /api/status`: Statut du serveur et nombre de clients
- `GET /api/clients`: Liste des clients connectés
- `GET /health`: Health check Nginx

## Dépannage

### Problèmes Communs

1. **Port déjà utilisé**:
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :3000
   
   # Changer le port dans docker-compose.yml
   ports:
     - "8080:3000"
   ```

2. **Build échoue**:
   ```bash
   # Vérifier les dépendances
   docker-compose run y-comm-server pnpm install
   
   # Reconstruire sans cache
   docker-compose build --no-cache
   ```

3. **WebSocket ne se connecte pas**:
   - Vérifier que le port est correctement mappé
   - Confirmer que Nginx transmet bien les upgrades WebSocket
   - Vérifier les firewalls

### Debug

```bash
# Mode debug
docker-compose run y-comm-server sh

# Vérifier la configuration
docker-compose config

# Inspecter le conteneur
docker inspect y-comm-websocket-server
```

## Performance

### Optimisations

1. **Multi-stage build** (pour production):
   ```dockerfile
   FROM node:23-alpine AS builder
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install --frozen-lockfile
   COPY . .
   RUN pnpm run build

   FROM node:23-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY package.json ./
   USER node
   CMD ["node", "dist/main.js"]
   ```

2. **Scaling horizontal**:
   ```bash
   # Scaler avec plusieurs instances
   docker-compose up -d --scale y-comm-server=3
   ```

## Mises à Jour

### Processus de Mise à Jour

1. Mettre à jour le code
2. Reconstruire l'image:
   ```bash
   docker-compose build
   ```
3. Déployer avec zero downtime:
   ```bash
   docker-compose up -d --no-deps y-comm-server
   ```

### Rollback

```bash
# Revenir à la version précédente
docker-compose down
docker tag y-comm-websocket-server:latest y-comm-websocket-server:backup
docker-compose up -d
```

## Support

Pour toute question sur le déploiement Docker:

1. Vérifier les logs: `docker-compose logs`
2. Consulter la documentation Docker officielle
3. Vérifier les issues GitHub du projet

---

**Note**: Cette documentation suppose que vous avez une compréhension de base de Docker et Docker Compose. Pour des besoins spécifiques ou des environnements complexes, adaptez la configuration selon vos requirements.
