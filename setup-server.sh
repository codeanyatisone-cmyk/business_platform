#!/bin/bash

# Frontend Server Setup Script
set -e

echo "🚀 Setting up Business Platform Frontend on server..."

# Create directories
mkdir -p /opt/business-platform-frontend

# Copy configuration files
echo "📋 Copying configuration files..."
cp docker-compose.prod.yml /opt/business-platform-frontend/docker-compose.yml
cp nginx.conf /opt/business-platform-frontend/

# Set up environment
echo "🔧 Setting up environment..."
cd /opt/business-platform-frontend

# Create nginx configuration for SSL
cat > nginx-ssl.conf << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://frontend:80;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Start services
echo "▶️ Starting services..."
docker-compose up -d

echo "✅ Frontend setup completed!"
echo "🌐 Frontend should be available at: https://yourdomain.com"
echo "📊 Check status with: docker-compose ps"