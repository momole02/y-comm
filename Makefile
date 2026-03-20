# Makefile pour Y-Comm Docker Deployment

.PHONY: help build up down restart logs clean status test deploy-prod deploy-dev

# Variables
COMPOSE_FILE = docker-compose.yml
PROD_COMPOSE = docker-compose.prod.yml
SERVICE = y-comm-server

help: ## Affiche l'aide
	@echo "Commandes disponibles:"
	@echo "  build          - Construit l'image Docker"
	@echo "  up             - Démarre les services (développement)"
	@echo "  down           - Arrête les services"
	@echo "  restart        - Redémarre les services"
	@echo "  logs           - Affiche les logs"
	@echo "  clean          - Nettoie les conteneurs et images"
	@echo "  status         - Affiche le statut des services"
	@echo "  test           - Exécute les tests de santé"
	@echo "  deploy-prod    - Déploie en production"
	@echo "  deploy-dev     - Déploie en développement"
	@echo "  shell          - Ouvre un shell dans le conteneur"
	@echo "  monitor        - Surveillance des ressources"

build: ## Construit l'image Docker
	docker-compose build

up: ## Démarre les services (développement)
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Services démarrés en mode développement"
	@echo "🌐 Application: http://localhost:3000"

down: ## Arrête les services
	docker-compose -f $(COMPOSE_FILE) down
	@echo "🛑 Services arrêtés"

restart: ## Redémarre les services
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "🔄 Services redémarrés"

logs: ## Affiche les logs
	docker-compose -f $(COMPOSE_FILE) logs -f

clean: ## Nettoie les conteneurs et images
	docker-compose -f $(COMPOSE_FILE) down --volumes --remove-orphans
	docker image prune -f
	@echo "🧹 Nettoyage terminé"

status: ## Affiche le statut des services
	docker-compose -f $(COMPOSE_FILE) ps

test: ## Exécute les tests de santé
	@echo "🏥 Test de santé du serveur..."
	@curl -f http://localhost:3000/api/status || echo "❌ Serveur indisponible"
	@echo "🔌 Test WebSocket..."
	@echo "Utilisez http://localhost:3000 pour tester le WebSocket"

deploy-prod: ## Déploie en production
	docker-compose -f $(PROD_COMPOSE) up -d
	@echo "🚀 Déploiement production terminé"
	@echo "🌐 Application: http://localhost"

deploy-dev: ## Déploie en développement
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "🚀 Déploiement développement terminé"
	@echo "🌐 Application: http://localhost:3000"

shell: ## Ouvre un shell dans le conteneur
	docker-compose -f $(COMPOSE_FILE) exec $(SERVICE) sh

monitor: ## Surveillance des ressources
	docker stats

# Commandes avancées
rebuild: ## Reconstruit sans cache
	docker-compose build --no-cache
	docker-compose up -d

scale: ## Scaler le service (usage: make scale N=3)
	@if [ -z "$(N)" ]; then echo "❌ Spécifiez le nombre d'instances: make scale N=3"; exit 1; fi
	docker-compose up -d --scale $(SERVICE)=$(N)
	@echo "📊 Service scalé à $(N) instances"

backup: ## Backup des données (si volumes utilisés)
	docker run --rm -v y-comm_y-comm-data:/data -v $(PWD):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
	@echo "💾 Backup créé: data-backup.tar.gz"

# Développement
dev-build: ## Build rapide pour développement
	docker-compose -f $(COMPOSE_FILE) build $(SERVICE)

dev-logs: ## Logs du service principal
	docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE)

dev-restart: ## Redémarre uniquement le service principal
	docker-compose -f $(COMPOSE_FILE) restart $(SERVICE)
