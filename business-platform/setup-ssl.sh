#!/bin/bash

# SSL Setup script for anyatis.com
set -e

SERVER="my-server"
DOMAIN="anyatis.com"
EMAIL="code.anyatis.one@gmail.com"

echo "🔒 Setting up SSL for $DOMAIN..."

# Upload docker-compose and nginx config
echo "📤 Uploading configuration files..."
scp docker-compose.yml $SERVER:/root/business-platform/
scp nginx.conf $SERVER:/root/business-platform/

# Setup SSL on server
ssh $SERVER << ENDSSH
set -e

echo "📦 Installing Certbot if not installed..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

echo "🐳 Restarting Docker container on port 3000..."
cd /root/business-platform
docker-compose down || true
docker-compose up -d

# Wait for container to start
sleep 5

echo "📝 Creating Nginx configuration for anyatis.com..."
cat > /etc/nginx/sites-available/anyatis.com << 'EOF'
server {
    listen 80;
    server_name anyatis.com www.anyatis.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo "🔗 Enabling site configuration..."
ln -sf /etc/nginx/sites-available/anyatis.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "✅ Testing Nginx configuration..."
nginx -t

echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo "🔒 Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo "✅ SSL certificate installed successfully!"
echo "🔄 Final Nginx reload..."
systemctl reload nginx

echo ""
echo "✨ SSL Setup Complete!"
echo "🌐 Your site is now available at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
ENDSSH

echo ""
echo "✅ SSL setup completed successfully!"
echo "🌐 Visit: https://$DOMAIN"






