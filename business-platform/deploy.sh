#!/bin/bash

# Deployment script for Business Platform
set -e

SERVER="my-server"
REMOTE_DIR="/root/business-platform"
PROJECT_NAME="business-platform"

echo "🚀 Starting deployment to $SERVER..."

# Create remote directory if not exists
echo "📁 Preparing remote directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Sync project files (excluding node_modules, build, etc.)
echo "📤 Uploading project files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'build' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env.local' \
  ./ $SERVER:$REMOTE_DIR/

# Build and run Docker container on server
echo "🐳 Building and starting Docker container..."
ssh $SERVER << 'ENDSSH'
cd /root/business-platform

# Stop and remove old container using docker compose
echo "Stopping old container..."
docker compose down || true

# Remove old images
echo "Cleaning up old images..."
docker image prune -f

# Build and start with docker compose
echo "Building and starting Docker container..."
docker compose up -d --build

# Check container status
echo "Checking container status..."
docker ps | grep business-platform

echo "✅ Deployment completed successfully!"
ENDSSH

echo ""
echo "✨ Deployment finished!"
echo "🌐 Your application should be available at: http://188.244.115.197"

