#!/bin/bash

echo "🚀 Deploying React Frontend to Server..."

# Create frontend directory on server
ssh my-server "mkdir -p /root/business-platform-frontend"

# Upload built frontend files
echo "📦 Uploading frontend files..."
rsync -avz --progress "./business-platform/build/" my-server:/root/business-platform-frontend/

# Create nginx configuration
echo "⚙️ Setting up nginx configuration..."
ssh my-server "cat > /etc/nginx/sites-available/business-platform << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /root/business-platform-frontend;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF"

# Enable the site
ssh my-server "ln -sf /etc/nginx/sites-available/business-platform /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"

echo "✅ Frontend deployment complete!"
echo "🌐 Your business platform should be accessible at: http://your-server-ip"


