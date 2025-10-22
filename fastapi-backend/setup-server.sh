#!/bin/bash

# Backend Server Setup Script
set -e

echo "🚀 Setting up Business Platform Backend on server..."

# Create directories
mkdir -p /opt/business-platform-backend
mkdir -p /opt/business-platform-backend/uploads
mkdir -p /opt/business-platform-backend/backups

# Copy configuration files
echo "📋 Copying configuration files..."
cp docker-compose.prod.yml /opt/business-platform-backend/docker-compose.yml
cp nginx.conf /opt/business-platform-backend/
cp env.example /opt/business-platform-backend/.env

# Set up environment
echo "🔧 Setting up environment..."
cd /opt/business-platform-backend

# Create production environment file
cat > .env << EOF
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/business_platform
DATABASE_URL_ASYNC=postgresql+asyncpg://postgres:postgres@postgres:5432/business_platform
EOF

# Set up SSL certificates
echo "🔒 Setting up SSL certificates..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot
fi

# Create nginx configuration for SSL
cat > nginx-ssl.conf << EOF
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://backend:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Start services
echo "▶️ Starting services..."
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend alembic upgrade head

echo "✅ Backend setup completed!"
echo "🌐 API should be available at: https://api.yourdomain.com"
echo "📊 Check status with: docker-compose ps"
