# 🚀 QUICK FRONTEND DEPLOYMENT

## **Run these commands in your terminal RIGHT NOW:**

### 1. Upload frontend files:
```bash
rsync -avz business-platform/build/ my-server:/root/frontend-build/
```

### 2. SSH to server and deploy:
```bash
ssh my-server
```

### 3. Once on server, run these commands:
```bash
# Create frontend Docker container
cat > /root/Dockerfile.frontend << 'EOF'
FROM nginx:alpine
COPY frontend-build/ /usr/share/nginx/html/
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } location /api/ { proxy_pass http://bp-backend:8000; } }' > /etc/nginx/conf.d/default.conf
EOF

# Stop old container
docker stop bp-frontend 2>/dev/null || true
docker rm bp-frontend 2>/dev/null || true

# Build and run
docker build -f /root/Dockerfile.frontend -t bp-frontend /root/
docker run -d --name bp-frontend --restart unless-stopped --network business-project_business-platform-network -p 3000:80 bp-frontend

# Check status
docker ps | grep bp-frontend
curl http://localhost:3000
```

## **That's it! Your frontend will be running on port 3000**

**Test it:**
- Frontend: http://your-server-ip:3000
- API: http://your-server-ip:3000/api/v1/test/health



