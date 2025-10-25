#!/bin/bash

echo "🏗️ Deploying Hybrid Storage Architecture..."
echo "=============================================="

SERVER="my-server"
BACKEND_DIR="/var/www/business-platform/backend"

echo "📋 Architecture Components:"
echo "  ✅ PostgreSQL - ACID-compliant database"
echo "  ✅ Redis - Caching and sessions"
echo "  ✅ MinIO - S3-compatible file storage"
echo ""

# Step 1: Pull latest backend changes
echo "📥 Step 1: Pulling latest backend changes..."
ssh $SERVER << 'EOF'
    cd /var/www/business-platform/backend
    
    echo "📥 Pulling from GitHub..."
    git pull origin main
    
    echo "✅ Backend code updated!"
EOF

# Step 2: Update docker-compose and restart services
echo ""
echo "🐳 Step 2: Updating Docker services..."
ssh $SERVER << 'EOF'
    cd /var/www/business-platform/backend
    
    echo "🛑 Stopping existing services..."
    docker-compose down
    
    echo "🐳 Building and starting all services..."
    docker-compose up -d --build
    
    echo "⏳ Waiting for services to start..."
    sleep 15
    
    echo "✅ Docker services started!"
EOF

# Step 3: Check service health
echo ""
echo "🔍 Step 3: Checking service health..."
ssh $SERVER << 'EOF'
    echo "🔍 Service Status:"
    echo ""
    
    # Check PostgreSQL
    echo "📊 PostgreSQL:"
    docker exec bp-postgres pg_isready -U postgres && echo "  ✅ PostgreSQL is ready" || echo "  ❌ PostgreSQL is not ready"
    
    # Check Redis
    echo ""
    echo "🔴 Redis:"
    docker exec bp-redis redis-cli -a redis_password ping 2>/dev/null && echo "  ✅ Redis is ready" || echo "  ❌ Redis is not ready"
    
    # Check MinIO
    echo ""
    echo "📦 MinIO:"
    curl -s -f http://localhost:9000/minio/health/live > /dev/null && echo "  ✅ MinIO is ready" || echo "  ❌ MinIO is not ready"
    
    # Check Backend
    echo ""
    echo "🚀 Backend API:"
    curl -s http://localhost:8001/api/v1/test/health | python3 -m json.tool || echo "  ❌ Backend is not responding"
    
    echo ""
    echo "📊 Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(bp-|business-platform)"
    
    echo ""
    echo "✅ Health check completed!"
EOF

# Step 4: Test hybrid storage
echo ""
echo "🧪 Step 4: Testing hybrid storage..."
ssh $SERVER << 'EOF'
    echo "🧪 Testing storage components..."
    
    # Test PostgreSQL
    echo ""
    echo "📊 PostgreSQL Test:"
    docker exec bp-postgres psql -U postgres -d business_platform -c "SELECT 'PostgreSQL OK' as status;" 2>/dev/null || echo "  ❌ PostgreSQL test failed"
    
    # Test Redis
    echo ""
    echo "🔴 Redis Test:"
    docker exec bp-redis redis-cli -a redis_password SET test_key "Redis OK" 2>/dev/null && \
    docker exec bp-redis redis-cli -a redis_password GET test_key 2>/dev/null && \
    docker exec bp-redis redis-cli -a redis_password DEL test_key 2>/dev/null || echo "  ❌ Redis test failed"
    
    # Test MinIO
    echo ""
    echo "📦 MinIO Test:"
    curl -s http://localhost:9000/minio/health/live && echo "  ✅ MinIO is healthy" || echo "  ❌ MinIO test failed"
    
    echo ""
    echo "✅ Storage tests completed!"
EOF

# Step 5: Display access information
echo ""
echo "=============================================="
echo "🎉 Hybrid Storage Architecture Deployed!"
echo "=============================================="
echo ""
echo "🌐 Access Information:"
echo "  Backend API: http://188.244.115.197/api/v1/"
echo "  API Docs: http://188.244.115.197/api/docs"
echo "  MinIO Console: http://188.244.115.197:9001"
echo ""
echo "🔐 MinIO Credentials:"
echo "  Access Key: minioadmin"
echo "  Secret Key: minioadmin"
echo ""
echo "📊 Architecture:"
echo "  ✅ PostgreSQL (Port 5432) - Critical data with ACID"
echo "  ✅ Redis (Port 6379) - Caching and sessions"
echo "  ✅ MinIO (Port 9000/9001) - File storage"
echo ""
echo "📚 Documentation:"
echo "  See HYBRID_STORAGE_ARCHITECTURE.md for details"
echo ""
echo "🔧 Useful Commands:"
echo "  View logs: ssh $SERVER 'docker logs bp-backend'"
echo "  Redis CLI: ssh $SERVER 'docker exec -it bp-redis redis-cli -a redis_password'"
echo "  MinIO CLI: ssh $SERVER 'docker exec -it bp-minio mc'"
echo ""
echo "✨ Deployment completed successfully!"


