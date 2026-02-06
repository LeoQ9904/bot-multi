#!/bin/bash

# Aether Manual Deployment Script
# This script manually pulls and deploys the latest version

set -e

APP_DIR="/home/ubuntu/aether"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

cd $APP_DIR

echo "🚀 Starting manual deployment..."

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found in $APP_DIR"
    exit 1
fi

# Pull latest code
print_info "Pulling latest code from GitHub..."
git pull origin main
print_status "Code pulled"

# Verify docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_info "Copying docker-compose.prod.yml..."
    cp docker-compose.prod.yml docker-compose.yml
fi

# Pull latest images
print_info "Pulling latest Docker images..."
docker compose pull
print_status "Images pulled"

# Stop current containers
print_info "Stopping current containers..."
docker compose down --remove-orphans
print_status "Containers stopped"

# Start new containers
print_info "Starting new containers..."
docker compose up -d
print_status "Containers started"

# Wait for services to be healthy
print_info "Waiting for services to be healthy (max 60 seconds)..."
for i in {1..12}; do
    if docker compose ps | grep -q "healthy\|running"; then
        print_status "Services are healthy"
        break
    fi
    sleep 5
done

# Run health check
if [ -f "scripts/health-check.sh" ]; then
    print_info "Running health check..."
    bash scripts/health-check.sh || print_error "Health check reported issues"
fi

# Cleanup old images
print_info "Cleaning up old images..."
docker image prune -f
print_status "Old images removed"

echo ""
print_status "Deployment completed successfully! 🎉"
echo ""
echo "Status:"
docker compose ps
