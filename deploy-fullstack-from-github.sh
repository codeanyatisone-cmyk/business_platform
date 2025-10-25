#!/bin/bash

# 🚀 Full Stack Deployment Script from GitHub Repositories
# This script deploys both frontend and backend from GitHub to your server

set -e

echo "🚀 Starting Full Stack Deployment from GitHub..."
echo "================================================"

# Configuration
SERVER="my-server"
FRONTEND_REPO="https://github.com/codeanyatisone-cmyk/business_platform.git"
BACKEND_REPO="https://github.com/codeanyatisone-cmyk/business_platform_backend.git"
DEPLOY_DIR="/var/www/business-platform"

echo "📋 Deployment Configuration:"
echo "  Server: $SERVER"
echo "  Frontend Repo: $FRONTEND_REPO"
echo "  Backend Repo: $BACKEND_REPO"
echo "  Deploy Directory: $DEPLOY_DIR"
echo ""

# Step 1: Connect to server and prepare environment
echo "🔧 Step 1: Preparing server environment..."
ssh $SERVER << 'EOF'
    echo "📁 Creating deployment directory..."
    sudo mkdir -p /var/www/business-platform
    sudo chown -R $USER:$USER /var/www/business-platform
    cd /var/www/business-platform
    
    echo "🧹 Cleaning up old deployments..."
    rm -rf frontend backend
    
    echo "📦 Installing required packages..."
    sudo apt update
    sudo apt install -y git docker.io docker-compose nginx curl
    
    echo "🐳 Starting Docker service..."
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    
    echo "✅ Server environment prepared!"
EOF

# Step 2: Clone and deploy backend
echo ""
echo "🔧 Step 2: Deploying Backend..."
ssh $SERVER << EOF
    cd $DEPLOY_DIR
    
    echo "📥 Cloning backend repository..."
    git clone $BACKEND_REPO backend
    cd backend
    
    echo "🔧 Setting up backend environment..."
    cp env.example .env
    
    # Update .env with production settings
    sed -i 's/localhost/bp-postgres/g' .env
    sed -i 's/secure_password_change_me/secure_password_change_me/g' .env
    
    echo "🐳 Building and starting backend with Docker..."
    docker-compose down || true
    docker-compose up -d --build
    
    echo "⏳ Waiting for backend to start..."
    sleep 30
    
    echo "🔍 Checking backend health..."
    curl -f http://localhost:8001/api/v1/test/health || echo "⚠️ Backend health check failed"
    
    echo "✅ Backend deployed!"
EOF

# Step 3: Clone and deploy frontend
echo ""
echo "🔧 Step 3: Deploying Frontend..."
ssh $SERVER << EOF
    cd $DEPLOY_DIR
    
    echo "📥 Cloning frontend repository..."
    git clone $FRONTEND_REPO frontend
    cd frontend
    
    echo "🔧 Setting up frontend environment..."
    cd business-platform
    
    # Create production environment file
    cat > .env << 'ENVEOF'
REACT_APP_API_URL=http://localhost:8001/api/v1
REACT_APP_ENVIRONMENT=production
ENVEOF
    
    echo "📦 Installing dependencies..."
    npm install
    
    echo "🏗️ Building frontend for production..."
    npm run build
    
    echo "🐳 Building frontend Docker image..."
    docker build -f Dockerfile.frontend -t business-platform-frontend .
    
    echo "🚀 Starting frontend container..."
    docker stop business-platform-frontend || true
    docker rm business-platform-frontend || true
    docker run -d --name business-platform-frontend -p 80:80 business-platform-frontend
    
    echo "✅ Frontend deployed!"
EOF

# Step 4: Configure Nginx
echo ""
echo "🔧 Step 4: Configuring Nginx..."
ssh $SERVER << 'EOF'
    echo "📝 Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/business-platform << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

    echo "🔗 Enabling site..."
    sudo ln -sf /etc/nginx/sites-available/business-platform /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    echo "🔄 Reloading Nginx..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo "✅ Nginx configured!"
EOF

# Step 5: Final health checks
echo ""
echo "🔧 Step 5: Running health checks..."
ssh $SERVER << 'EOF'
    echo "🔍 Checking services..."
    
    echo "  Backend health:"
    curl -s http://localhost:8001/api/v1/test/health | python3 -m json.tool || echo "❌ Backend not responding"
    
    echo "  Frontend health:"
    curl -s -I http://localhost:80 | head -1 || echo "❌ Frontend not responding"
    
    echo "  Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo "✅ Health checks completed!"
EOF

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "🌐 Your Business Platform is now running at:"
echo "  Frontend: http://YOUR_SERVER_IP/"
echo "  Backend API: http://YOUR_SERVER_IP/api/v1/"
echo ""
echo "📊 To check status:"
echo "  ssh $SERVER 'docker ps'"
echo "  ssh $SERVER 'curl http://localhost:8001/api/v1/test/health'"
echo ""
echo "🔧 To view logs:"
echo "  ssh $SERVER 'docker logs bp-backend'"
echo "  ssh $SERVER 'docker logs business-platform-frontend'"
echo ""
echo "✨ Deployment completed successfully!"
