#!/bin/bash

# Business Platform Backend Deployment Script
# This script deploys the backend to the configured server

set -e

# Load server configuration
source config/server.conf

echo "🚀 Starting backend deployment to $SERVER_HOST..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t business-platform-backend:latest .

# Save Docker image to tar file
echo "💾 Saving Docker image..."
docker save business-platform-backend:latest -o business-platform-backend.tar

# Copy files to server
echo "📤 Uploading files to server..."
scp -P $SERVER_PORT business-platform-backend.tar $SERVER_USER@$SERVER_HOST:/tmp/
scp -P $SERVER_PORT docker-compose.yml $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT -r config/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# Deploy on server
echo "🔧 Deploying on server..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
cd /opt/business-platform-backend

# Load Docker image
echo "📥 Loading Docker image..."
docker load -i /tmp/business-platform-backend.tar

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start new containers
echo "▶️ Starting new containers..."
docker-compose up -d

# Clean up
echo "🧹 Cleaning up..."
rm -f /tmp/business-platform-backend.tar

# Show status
echo "📊 Container status:"
docker-compose ps

echo "✅ Backend deployment completed!"
EOF

# Clean up local files
echo "🧹 Cleaning up local files..."
rm -f business-platform-backend.tar

echo "🎉 Backend deployment completed successfully!"
echo "🌐 API should be available at: https://$DOMAIN"
