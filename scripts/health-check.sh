#!/bin/bash

# Aether Health Check & Monitoring Script
# This script monitors the health of all running containers

APP_DIR="/home/ubuntu/aether"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
EMAIL="${ALERT_EMAIL:-admin@example.com}"

cd $APP_DIR

echo "🏥 Checking container health..."

# Container status check
check_container_health() {
    local image_name=$1
    local health_status=$(docker ps --filter "name=$image_name" --format "{{.Status}}")
    
    if [ -z "$health_status" ]; then
        return 2  # Container not running
    elif [[ $health_status == *"unhealthy"* ]]; then
        return 1  # Container unhealthy
    else
        return 0  # Container healthy
    fi
}

# Containers to monitor
containers=("aether-api" "aether-web" "aether-postgres" "aether-nginx")
unhealthy_containers=()

for container in "${containers[@]}"; do
    echo "Checking $container..."
    
    if check_container_health $container; then
        echo "✅ $container is healthy"
    else
        status=$?
        if [ $status -eq 2 ]; then
            echo "❌ $container is not running"
            unhealthy_containers+=("$container (not running)")
        else
            echo "⚠️  $container is unhealthy"
            unhealthy_containers+=("$container (unhealthy)")
        fi
    fi
done

# Check disk space
echo ""
echo "💾 Checking disk space..."
disk_usage=$(df -h $APP_DIR | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $disk_usage -gt 90 ]; then
    echo "⚠️  Warning: Disk usage is ${disk_usage}%"
    unhealthy_containers+=("Low disk space (${disk_usage}%)")
elif [ $disk_usage -gt 80 ]; then
    echo "⚠️  Caution: Disk usage is ${disk_usage}%"
else
    echo "✅ Disk usage: ${disk_usage}%"
fi

# Check Docker daemon
echo ""
echo "🐳 Checking Docker daemon..."
if docker ps &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is not running"
    unhealthy_containers+=("Docker daemon")
fi

# Summary
echo ""
if [ ${#unhealthy_containers[@]} -eq 0 ]; then
    echo "✅ All services are healthy!"
    exit 0
else
    echo "❌ Issues detected:"
    for container in "${unhealthy_containers[@]}"; do
        echo "  - $container"
    done
    
    # Send alert if webhook is configured
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        message="🚨 Aether health check failed:\n"
        for container in "${unhealthy_containers[@]}"; do
            message="$message• $container\n"
        done
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            $SLACK_WEBHOOK || true
    fi
    
    exit 1
fi
