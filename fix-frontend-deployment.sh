#!/bin/bash

# Quick fix for frontend deployment issues

echo "🔧 Fixing frontend deployment issues..."

ssh my-server << 'EOF'
    cd /var/www/business-platform/frontend/business-platform
    
    echo "📁 Creating missing public/index.html..."
    mkdir -p public
    cat > public/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Business Platform" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>Business Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
HTMLEOF

    echo "📁 Creating missing Dockerfile.frontend..."
    cat > Dockerfile.frontend << 'DOCKEREOF'
FROM nginx:alpine

# Copy built React app
COPY build/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
DOCKEREOF

    echo "🏗️ Building frontend for production..."
    npm run build
    
    echo "🐳 Stopping existing frontend container..."
    docker stop business-platform-frontend || true
    docker rm business-platform-frontend || true
    
    echo "🐳 Building new frontend Docker image..."
    docker build -f Dockerfile.frontend -t business-platform-frontend .
    
    echo "🚀 Starting frontend container on port 3001..."
    docker run -d --name business-platform-frontend -p 3001:80 business-platform-frontend
    
    echo "✅ Frontend fixed and deployed!"
EOF

echo "🔧 Updating Nginx configuration..."
ssh my-server << 'EOF'
    echo "📝 Updating Nginx configuration for port 3001..."
    sudo tee /etc/nginx/sites-available/business-platform << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
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

    echo "🔄 Reloading Nginx..."
    sudo nginx -t
    sudo systemctl reload nginx
    
    echo "✅ Nginx updated!"
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
echo "🎉 Frontend deployment fixed!"
echo "🌐 Your Business Platform is now running at:"
echo "  Frontend: http://188.244.115.197/"
echo "  Backend API: http://188.244.115.197/api/v1/"
echo ""
echo "✨ Enhanced Task Manager is now live on the server!"

