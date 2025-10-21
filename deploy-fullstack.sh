#!/bin/bash

# Full Stack Deployment Script for Business Platform
# This script deploys both frontend and backend using Docker

set -e

echo "🚀 Starting full-stack deployment process..."

# Configuration
BACKEND_IMAGE="ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest"
FRONTEND_IMAGE="ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest"
PROJECT_DIR="/opt/business-project"

# Navigate to project directory
cd $PROJECT_DIR
echo "📁 Current directory: $(pwd)"

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git fetch origin
git reset --hard origin/main
git clean -fd

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
POSTGRES_PASSWORD=secure_password_change_me
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
BACKEND_IMAGE=$BACKEND_IMAGE
FRONTEND_IMAGE=$FRONTEND_IMAGE
EOF
fi

# Pull latest Docker images
echo "📥 Pulling latest Docker images..."
docker pull $BACKEND_IMAGE
docker pull $FRONTEND_IMAGE

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.fullstack.yml down || true

# Start with new images
echo "🚀 Starting containers with new images..."
docker compose -f docker-compose.fullstack.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Verify deployment
echo "🧪 Verifying deployment..."

# Check if containers are running
if ! docker ps | grep -q "bp-backend"; then
    echo "❌ Backend container not running!"
    docker logs bp-backend
    exit 1
fi

if ! docker ps | grep -q "bp-frontend"; then
    echo "❌ Frontend container not running!"
    docker logs bp-frontend
    exit 1
fi

# Test backend health
if curl -f -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed"
fi

# Test frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend responding"
else
    echo "❌ Frontend not responding"
    exit 1
fi

# Test domain
if curl -f -s http://v4.business > /dev/null; then
    echo "✅ Domain responding"
else
    echo "⚠️  Domain not responding (may be DNS/cache issue)"
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Show deployment info
echo "📊 Full Stack Deployment Summary:"
echo "  - Git commit: $(git rev-parse HEAD)"
echo "  - Backend image: $BACKEND_IMAGE"
echo "  - Frontend image: $FRONTEND_IMAGE"
echo "  - Deployment time: $(date)"
echo "  - Backend URL: http://localhost:3001"
echo "  - Frontend URL: http://localhost:3000"
echo "  - Domain: http://v4.business"

echo "🎉 Full stack deployment completed successfully!"
