#!/bin/bash

echo "🔄 Redeploying frontend with TypeScript fix..."

ssh my-server << 'EOF'
    cd /var/www/business-platform/frontend
    
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    echo "🏗️ Building frontend for production..."
    cd business-platform
    npm run build
    
    echo "🐳 Stopping existing frontend container..."
    docker stop business-platform-frontend || true
    docker rm business-platform-frontend || true
    
    echo "🐳 Building new frontend Docker image..."
    docker build -f Dockerfile.frontend -t business-platform-frontend .
    
    echo "🚀 Starting frontend container on port 3001..."
    docker run -d --name business-platform-frontend -p 3001:80 business-platform-frontend
    
    echo "✅ Frontend redeployed successfully!"
EOF

echo "🔍 Final health check..."
ssh my-server << 'EOF'
    echo "🔍 Checking services..."
    
    echo "  Backend health:"
    curl -s http://localhost:8001/api/v1/test/health | python3 -m json.tool || echo "❌ Backend not responding"
    
    echo "  Frontend health:"
    curl -s -I http://localhost:3001 | head -1 || echo "❌ Frontend not responding"
    
    echo "  Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(business-platform|bp-)"
    
    echo "✅ Health checks completed!"
EOF

echo ""
echo "🎉 Enhanced Task Manager is now live!"
echo "🌐 Access your Business Platform at:"
echo "  Frontend: http://188.244.115.197/"
echo "  Backend API: http://188.244.115.197/api/v1/"
echo ""
echo "✨ Notion-like Task Manager features:"
echo "  📋 Board view with drag-and-drop columns"
echo "  📝 List view with smart filtering"
echo "  📅 Calendar view with date-based tasks"
echo "  🔍 Advanced search and filtering"
echo "  ⭐ Favorites and priority management"
echo "  🎨 Clean Notion-inspired design"

