# Business Platform CI/CD Deployment Guide

This guide explains how to deploy the Business Platform with separate frontend and backend repositories using CI/CD pipelines.

## Repository Structure

- **Frontend Repository**: `https://github.com/codeanyatisone-cmyk/business_platform`
- **Backend Repository**: `https://github.com/codeanyatisone-cmyk/business_platform_backend`

## CI/CD Pipeline Overview

Both repositories have automated CI/CD pipelines that:
1. **Test** the code on every push/PR
2. **Build** Docker images and push to GitHub Container Registry
3. **Deploy** automatically to your server on main branch pushes
4. **Health check** after deployment

## Server Setup

### 1. Initial Server Preparation

Run these commands on your server to prepare the environment:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx and Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

### 2. Backend Setup

```bash
# Clone backend repository
git clone https://github.com/codeanyatisone-cmyk/business_platform_backend.git
cd business_platform_backend

# Run setup script
chmod +x setup-server.sh
./setup-server.sh
```

### 3. Frontend Setup

```bash
# Clone frontend repository
git clone https://github.com/codeanyatisone-cmyk/business_platform.git
cd business_platform

# Run setup script
chmod +x setup-server.sh
./setup-server.sh
```

## GitHub Secrets Configuration

Configure these secrets in both repositories:

### Backend Repository Secrets
- `SERVER_HOST`: Your server IP or domain
- `SERVER_USER`: SSH username (usually `root`)
- `SERVER_PORT`: SSH port (usually `22`)
- `SERVER_SSH_KEY`: Your private SSH key
- `BACKEND_URL`: `https://api.yourdomain.com`

### Frontend Repository Secrets
- `SERVER_HOST`: Your server IP or domain
- `SERVER_USER`: SSH username (usually `root`)
- `SERVER_PORT`: SSH port (usually `22`)
- `SERVER_SSH_KEY`: Your private SSH key
- `FRONTEND_URL`: `https://yourdomain.com`
- `REACT_APP_API_URL`: `https://api.yourdomain.com/api/v1`

## SSL Certificate Setup

### Backend API Domain
```bash
certbot --nginx -d api.yourdomain.com
```

### Frontend Domain
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Environment Configuration

### Backend Environment (.env)
```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=120
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/business_platform
DATABASE_URL_ASYNC=postgresql+asyncpg://postgres:postgres@postgres:5432/business_platform
```

### Frontend Environment
The frontend gets its API URL from the GitHub secret `REACT_APP_API_URL` during build.

## Deployment Flow

### Automatic Deployment
1. **Push to main branch** in either repository
2. **CI/CD pipeline triggers** automatically
3. **Tests run** to ensure code quality
4. **Docker image builds** and pushes to GitHub Container Registry
5. **Server deployment** happens automatically
6. **Health check** verifies deployment success

### Manual Deployment
If you need to deploy manually:

```bash
# Backend
cd /opt/business-platform-backend
docker-compose pull
docker-compose up -d

# Frontend
cd /opt/business-platform-frontend
docker-compose pull
docker-compose up -d
```

## Monitoring and Maintenance

### Check Service Status
```bash
# Backend
cd /opt/business-platform-backend
docker-compose ps

# Frontend
cd /opt/business-platform-frontend
docker-compose ps
```

### View Logs
```bash
# Backend logs
docker logs bp-backend

# Frontend logs
docker logs bp-frontend
```

### Database Migrations
```bash
cd /opt/business-platform-backend
docker-compose exec backend alembic upgrade head
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**: Ensure domains point to your server before running certbot
2. **Port Conflicts**: Check that ports 80, 443, 3000, and 3001 are available
3. **Docker Issues**: Ensure Docker is running and you have sufficient disk space
4. **CI/CD Failures**: Check GitHub Actions logs for specific error messages

### Log Locations
- Backend logs: `docker logs bp-backend`
- Frontend logs: `docker logs bp-frontend`
- Nginx logs: `/var/log/nginx/`
- GitHub Actions logs: Available in the repository's Actions tab

## Security Considerations

- Change default passwords in production
- Use strong secret keys
- Regularly update dependencies
- Monitor logs for suspicious activity
- Keep SSL certificates renewed
- Use proper firewall rules

## Backup Strategy

- Database backups: Use PostgreSQL backup tools
- Application backups: Git repositories serve as code backups
- Configuration backups: Keep server configuration files in version control
- Container images: Stored in GitHub Container Registry

## Integration Testing

The frontend and backend are designed to work together:
- Frontend makes API calls to backend endpoints
- JWT authentication flows between services
- CORS is configured for cross-origin requests
- Health checks ensure both services are running

Your Business Platform is now fully automated with CI/CD pipelines for both frontend and backend! 🚀
