#!/bin/bash

# 🔄 Business Platform Restart Script
# This script ensures all containers restart properly with auto-restart policies

set -e

echo "🔄 Restarting Business Platform Containers..."
echo "=============================================="

# Configuration
SERVER="my-server"
BACKEND_DIR="/var/www/business-platform/backend"
FRONTEND_DIR="/var/www/business-platform/frontend/business-platform"

# Step 1: Stop all business platform containers
echo "🛑 Step 1: Stopping all business platform containers..."
ssh "$SERVER" "
  echo 'Stopping backend containers...'
  cd $BACKEND_DIR
  docker compose down || true
  
  echo 'Stopping frontend container...'
  docker stop bp-frontend || true
  docker rm bp-frontend || true
  
  echo '✅ All containers stopped'
"

# Step 2: Start backend with auto-restart
echo "🚀 Step 2: Starting backend services..."
ssh "$SERVER" "
  cd $BACKEND_DIR
  echo 'Starting PostgreSQL, Redis, MinIO, and Backend...'
  docker compose up -d
  
  echo '⏳ Waiting for services to initialize...'
  sleep 30
  
  echo '✅ Backend services started'
"

# Step 3: Start frontend with auto-restart
echo "🌐 Step 3: Starting frontend service..."
ssh "$SERVER" "
  cd $FRONTEND_DIR
  echo 'Starting frontend container...'
  docker run -d --name bp-frontend --restart=always -p 3001:80 -v \$(pwd)/build:/usr/share/nginx/html nginx:alpine
  
  echo '✅ Frontend service started'
"

# Step 4: Verify all containers are running
echo "🔍 Step 4: Verifying container status..."
ssh "$SERVER" "
  echo '📊 Container Status:'
  echo ''
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep 'bp-'
  echo ''
  
  echo '🔄 Restart Policies:'
  docker inspect bp-backend bp-postgres bp-redis bp-minio bp-frontend --format '{{.Name}}: {{.HostConfig.RestartPolicy.Name}}'
  echo ''
"

# Step 5: Health checks
echo "🏥 Step 5: Running health checks..."
ssh "$SERVER" "
  echo '🏥 Health Checks:'
  echo ''
  
  echo '📊 PostgreSQL:'
  docker exec bp-postgres pg_isready -U postgres && echo '  ✅ PostgreSQL is ready' || echo '  ❌ PostgreSQL is not ready'
  
  echo '🔴 Redis:'
  docker exec bp-redis redis-cli -a redis_password ping && echo '  ✅ Redis is ready' || echo '  ❌ Redis is not ready'
  
  echo '📦 MinIO:'
  curl -f http://localhost:9000/minio/health/live && echo '  ✅ MinIO is ready' || echo '  ❌ MinIO is not ready'
  
  echo '🚀 Backend API:'
  curl -s http://localhost:8001/api/v1/test/health | python3 -m json.tool || echo '  ❌ Backend API not responding'
  
  echo '🌐 Frontend:'
  curl -s -I http://localhost:3001 | head -1 && echo '  ✅ Frontend is ready' || echo '  ❌ Frontend is not ready'
  echo ''
"

echo "=============================================="
echo "🎉 Business Platform Restart Complete!"
echo "=============================================="
echo ""
echo "🌐 Access Information:"
echo "  Frontend: http://188.244.115.197:3001"
echo "  Backend API: http://188.244.115.197:8001/api/v1/"
echo "  API Docs: http://188.244.115.197:8001/api/docs"
echo "  MinIO Console: http://188.244.115.197:9001"
echo ""
echo "🔄 Auto-Restart Status:"
echo "  ✅ All containers configured with 'restart: always'"
echo "  ✅ Containers will automatically restart on failure"
echo "  ✅ Containers will restart after server reboot"
echo ""
echo "🔧 Useful Commands:"
echo "  View logs: ssh $SERVER 'docker logs bp-backend'"
echo "  Restart: ssh $SERVER 'cd $BACKEND_DIR && docker compose restart'"
echo "  Status: ssh $SERVER 'docker ps | grep bp-'"
echo ""
echo "✨ Platform is ready and will auto-restart on failures!"

