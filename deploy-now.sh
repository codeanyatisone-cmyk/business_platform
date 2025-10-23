#!/bin/bash
# Quick deployment script - copy and paste this into your terminal

echo "🚀 DEPLOYING FRONTEND NOW..."

# Step 1: Upload files
echo "📦 Uploading frontend files..."
rsync -avz business-platform/build/ my-server:/root/frontend-build/

# Step 2: Deploy on server
echo "🐳 Deploying on server..."
ssh my-server << 'EOF'
echo "Creating Dockerfile..."
cat > /root/Dockerfile.frontend << 'DOCKERFILE'
FROM nginx:alpine
COPY frontend-build/ /usr/share/nginx/html/
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } location /api/ { proxy_pass http://bp-backend:8000; } }' > /etc/nginx/conf.d/default.conf
DOCKERFILE

echo "Stopping old container..."
docker stop bp-frontend 2>/dev/null || true
docker rm bp-frontend 2>/dev/null || true

echo "Building and running frontend..."
docker build -f /root/Dockerfile.frontend -t bp-frontend /root/
docker run -d --name bp-frontend --restart unless-stopped --network business-project_business-platform-network -p 3000:80 bp-frontend

echo "Checking status..."
docker ps | grep bp-frontend
echo "Testing frontend..."
curl -s http://localhost:3000 | head -5
echo ""
echo "✅ FRONTEND DEPLOYED!"
echo "🌐 Access at: http://your-server-ip:3000"
EOF

echo "🎉 DEPLOYMENT COMPLETE!"



