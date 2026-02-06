#!/bin/bash

# Aether EC2 Initial Setup Script
# This script configures an EC2 instance for hosting the Aether application

set -e

echo "🚀 Starting Aether EC2 Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root or with sudo"
   exit 1
fi

# Update system
print_info "Updating system packages..."
apt-get update
apt-get upgrade -y
print_status "System updated"

# Install required packages
print_info "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    docker.io \
    docker-compose \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    vim \
    nano
print_status "Packages installed"

# Add current user to docker group (optional, for non-root docker commands)
print_info "Configuring Docker..."
usermod -aG docker ubuntu 2>/dev/null || true
systemctl enable docker
systemctl start docker
print_status "Docker configured"

# Create application directory
print_info "Creating application directory structure..."
APP_DIR="/home/ubuntu/aether"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository if it doesn't exist
if [ ! -d ".git" ]; then
    print_info "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/bot-multi.git .
else
    print_info "Repository already exists, pulling latest changes..."
    git pull origin main
fi
print_status "Repository ready"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    print_error "⚠️  Please edit $APP_DIR/.env with your credentials"
    print_info "Run: nano $APP_DIR/.env"
    exit 1
else
    print_status ".env file exists"
fi

# Copy production docker-compose file
print_info "Configuring Docker Compose..."
cp docker-compose.prod.yml $APP_DIR/docker-compose.yml
print_status "Docker Compose configured"

# Create required directories
print_info "Creating required directories..."
mkdir -p $APP_DIR/certbot/conf
mkdir -p $APP_DIR/certbot/www
mkdir -p $APP_DIR/ssl
print_status "Directories created"

# Setup firewall
print_info "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 5432/tcp    # PostgreSQL (only from localhost)
print_status "Firewall configured"

# Setup fail2ban for SSH protection
print_info "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
print_status "fail2ban configured"

# Create a directory for logs
mkdir -p $APP_DIR/logs

# Initial docker image pull
print_info "Pulling Docker images (this may take a few minutes)..."
cd $APP_DIR
docker compose pull || true
print_status "Docker images pulled"

print_info ""
print_status "EC2 Setup Complete! 🎉"
print_info ""
echo "Next steps:"
echo "1. Edit the .env file with your credentials:"
echo "   nano $APP_DIR/.env"
echo ""
echo "2. Start the application:"
echo "   cd $APP_DIR && docker compose up -d"
echo ""
echo "3. (Optional) Setup SSL with Let's Encrypt:"
echo "   sudo certbot certonly --webroot -w $APP_DIR/certbot/www -d your-domain.com"
echo ""
echo "4. Update nginx.conf with your domain and uncomment the HTTPS section"
echo ""
echo "5. Restart nginx container:"
echo "   docker compose restart nginx"
echo ""
