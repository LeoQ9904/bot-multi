#!/bin/bash

# Aether Database Backup Script
# This script creates daily backups of the PostgreSQL database

set -e

APP_DIR="/home/ubuntu/aether"
BACKUP_DIR="$APP_DIR/backups"
DB_USER="${DB_USER:-aether_user}"
DB_NAME="${DB_NAME:-aether_db}"
RETENTION_DAYS=30

echo "💾 Starting Database Backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create dated backup file
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"

# Perform backup
echo "Backing up database to $BACKUP_FILE..."
docker exec aether-postgres pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Remove old backups (older than RETENTION_DAYS)
    echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "✅ Old backups cleaned up"
else
    echo "❌ Backup failed"
    exit 1
fi
