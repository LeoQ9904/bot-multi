#!/bin/bash

# Aether SSL Renewal Script
# This script renews Let's Encrypt SSL certificates and restarts nginx

set -e

APP_DIR="/home/ubuntu/aether"
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${LETSENCRYPT_EMAIL:-admin@your-domain.com}"

echo "🔄 Starting SSL Certificate Renewal..."

# Renew certificate
echo "Attempting to renew certificate for $DOMAIN..."
certbot renew --quiet --agree-tos --email $EMAIL

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ Certificate renewal successful"
    
    # Restart nginx to use new certificate
    cd $APP_DIR
    docker compose restart nginx
    
    echo "✅ Nginx restarted with new certificate"
else
    echo "❌ Certificate renewal failed"
    exit 1
fi
