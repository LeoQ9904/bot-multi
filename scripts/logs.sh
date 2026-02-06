#!/bin/bash

# Aether Logs & Debugging Script
# This script helps view and manage application logs

APP_DIR="/home/ubuntu/aether"
cd $APP_DIR

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo -e "${BLUE}📋 Aether Logs & Debugging${NC}"
    echo ""
    echo "1) View API logs"
    echo "2) View Web logs"
    echo "3) View Database logs"
    echo "4) View Nginx logs"
    echo "5) View all container logs"
    echo "6) Follow API logs (live)"
    echo "7) Follow Web logs (live)"
    echo "8) View container status"
    echo "9) Restart a container"
    echo "10) View Docker events"
    echo "0) Exit"
    echo ""
}

case "${1}" in
    "1"|"api")
        echo "📜 API Logs:"
        docker compose logs aether-api
        ;;
    "2"|"web")
        echo "📜 Web Logs:"
        docker compose logs aether-web
        ;;
    "3"|"db")
        echo "📜 Database Logs:"
        docker compose logs aether-postgres
        ;;
    "4"|"nginx")
        echo "📜 Nginx Logs:"
        docker compose logs aether-nginx
        ;;
    "5"|"all")
        echo "📜 All Logs:"
        docker compose logs
        ;;
    "6"|"follow-api")
        echo "📜 Following API logs (Press Ctrl+C to stop):"
        docker compose logs -f aether-api
        ;;
    "7"|"follow-web")
        echo "📜 Following Web logs (Press Ctrl+C to stop):"
        docker compose logs -f aether-web
        ;;
    "8"|"status")
        echo "📊 Container Status:"
        docker compose ps
        ;;
    "9"|"restart")
        if [ -z "$2" ]; then
            echo "Usage: $0 restart <container-name>"
            echo "Available containers: api, web, postgres, nginx"
        else
            echo "🔄 Restarting $2..."
            docker compose restart aether-$2
            echo "✅ Done"
        fi
        ;;
    "10"|"events")
        echo "📡 Docker Events (Press Ctrl+C to stop):"
        docker events --filter 'container=aether-api' --filter 'container=aether-web' --filter 'container=aether-postgres' --filter 'container=aether-nginx'
        ;;
    "")
        show_menu
        ;;
    *)
        echo "Invalid option: $1"
        show_menu
        exit 1
        ;;
esac
