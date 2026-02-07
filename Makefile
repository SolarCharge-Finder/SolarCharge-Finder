# Makefile for SolarCharge Finder

.PHONY: help install dev build test lint clean docker-dev docker-prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install
	cd backend && npm install
	cd client && npm install

dev: ## Start development servers
	npm run dev

build: ## Build for production
	npm run build

test: ## Run all tests
	npm run test

lint: ## Run linters
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

clean: ## Clean node_modules and build artifacts
	rm -rf node_modules
	rm -rf backend/node_modules
	rm -rf client/node_modules
	rm -rf backend/coverage
	rm -rf client/coverage
	rm -rf client/dist

docker-dev: ## Start Docker development environment
	docker-compose up

docker-dev-build: ## Build and start Docker development environment
	docker-compose up --build

docker-prod: ## Start Docker production environment
	docker-compose -f docker-compose.prod.yml up

docker-prod-build: ## Build and start Docker production environment
	docker-compose -f docker-compose.prod.yml up --build

docker-down: ## Stop Docker containers
	docker-compose down

docker-clean: ## Remove Docker containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
