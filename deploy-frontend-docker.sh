#!/bin/bash

echo "🚀 Deploying Business Platform Frontend..."

# Upload Docker files to server
echo "📦 Uploading Docker configuration..."
scp Dockerfile.frontend my-server:/root/
scp docker-compose.frontend.yml my-server:/root/

# Upload built frontend
echo "📦 Uploading frontend build..."
rsync -avz --progress business-platform/build/ my-server:/root/frontend-build/

# Deploy on server
echo "🐳 Building and starting frontend container..."
ssh my-server << 'EOF'
cd /root

# Create Dockerfile for frontend
cat > Dockerfile.frontend << 'DOCKERFILE'
FROM nginx:alpine
COPY frontend-build/ /usr/share/nginx/html/
COPY << 'NGINX' /etc/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /api/ {
            proxy_pass http://bp-backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
NGINX
DOCKERFILE

# Stop existing frontend container
docker stop bp-frontend 2>/dev/null || true
docker rm bp-frontend 2>/dev/null || true

# Build and run frontend
docker build -f Dockerfile.frontend -t bp-frontend .
docker run -d --name bp-frontend --restart unless-stopped --network business-project_business-platform-network -p 3000:80 bp-frontend

echo "✅ Frontend deployed successfully!"
echo "🌐 Frontend available at: http://localhost:3000"
echo "🔗 API proxy configured to backend"
EOF

echo "🎉 Deployment complete!"
