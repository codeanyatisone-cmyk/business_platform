#!/bin/bash

# Quick Deploy Script for Business Platform
# This script can be run directly on your server to deploy the application

set -e

# Configuration - Update these values
DOMAIN_NAME="${DOMAIN_NAME:-your-domain.com}"
EMAIL="${EMAIL:-your-email@example.com}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-secure_password_$(date +%s)}"
SECRET_KEY="${SECRET_KEY:-$(openssl rand -hex 32)}"

echo "🚀 Quick Deploy Script for Business Platform"
echo "Domain: $DOMAIN_NAME"
echo "Email: $EMAIL"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Please don't run this script as root. Use a regular user with sudo access."
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "⚠️  Please log out and log back in for Docker group changes to take effect."
    echo "   Then run this script again."
    exit 0
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx and Certbot
echo "🌐 Installing Nginx and Certbot..."
sudo apt install -y nginx certbot python3-certbot-nginx

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /opt/business-project
sudo chown $USER:$USER /opt/business-project
cd /opt/business-project

# Create docker-compose.yml
echo "📝 Creating docker-compose.yml..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:13-alpine
    container_name: bp-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: business_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - business-platform-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest
    container_name: bp-backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@postgres:5432/business_platform
      - DATABASE_URL_ASYNC=postgresql+asyncpg://postgres:$POSTGRES_PASSWORD@postgres:5432/business_platform
      - SECRET_KEY=$SECRET_KEY
      - ACCESS_TOKEN_EXPIRE_MINUTES=120
      - ENVIRONMENT=production
      - DEBUG=False
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - business-platform-network

  frontend:
    image: ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest
    container_name: bp-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    depends_on:
      backend:
        condition: service_started
    networks:
      - business-platform-network

  nginx:
    image: nginx:alpine
    container_name: bp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - business-platform-network

volumes:
  postgres_data:

networks:
  business-platform-network:
    driver: bridge
EOF

# Create nginx.conf
echo "🌐 Creating nginx.conf..."
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }
    
    upstream frontend {
        server frontend:80;
    }

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name $DOMAIN_NAME;
        return 301 https://\$server_name\$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN_NAME;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/api/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Auth routes with stricter rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend/api/v1/auth/login;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create SSL directory
echo "🔒 Creating SSL directory..."
mkdir -p ssl

# Create environment file
echo "📝 Creating environment file..."
cat > .env << EOF
# Database
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# JWT Configuration
SECRET_KEY=$SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Docker Images
BACKEND_IMAGE=ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest
FRONTEND_IMAGE=ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest
EOF

# Set up SSL certificate
echo "🔒 Setting up SSL certificate..."
if [ ! -f ssl/fullchain.pem ]; then
    echo "📋 Please make sure your domain $DOMAIN_NAME points to this server's IP address."
    echo "   Then press Enter to continue with SSL setup..."
    read
    
    # Stop any existing nginx
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Generate SSL certificate
    sudo certbot certonly --standalone -d $DOMAIN_NAME --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem ssl/
    sudo chown $USER:$USER ssl/*.pem
    
    echo "✅ SSL certificate created successfully!"
else
    echo "✅ SSL certificate already exists!"
fi

# Start the application
echo "🚀 Starting Business Platform..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Verify deployment
echo "✅ Verifying deployment..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Check logs: docker compose logs backend"
fi

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    echo "📋 Check logs: docker compose logs frontend"
fi

# Create renewal script
echo "📝 Creating SSL renewal script..."
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Renewing SSL certificate..."

# Stop nginx
docker compose stop nginx

# Renew certificate
sudo certbot renew --standalone

# Copy new certificates
sudo cp /etc/letsencrypt/live/*/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/*/privkey.pem ssl/
sudo chown $USER:$USER ssl/*.pem

# Restart nginx
docker compose start nginx

echo "✅ SSL certificate renewed successfully!"
EOF

chmod +x renew-ssl.sh

# Add cron job for automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /opt/business-project/renew-ssl.sh >> /opt/business-project/ssl-renewal.log 2>&1") | crontab -

echo ""
echo "🎉 Business Platform deployed successfully!"
echo ""
echo "📋 Application Details:"
echo "   🌐 URL: https://$DOMAIN_NAME"
echo "   🔧 API: https://$DOMAIN_NAME/api/v1/"
echo "   📚 Docs: https://$DOMAIN_NAME/api/docs"
echo ""
echo "📋 Management Commands:"
echo "   📊 Status: docker compose ps"
echo "   📝 Logs: docker compose logs -f"
echo "   🔄 Restart: docker compose restart"
echo "   🛑 Stop: docker compose down"
echo "   🚀 Start: docker compose up -d"
echo ""
echo "🔒 SSL certificate will auto-renew via cron job"
echo "📁 Project files are in: /opt/business-project"
echo ""
echo "✅ Deployment completed!"
