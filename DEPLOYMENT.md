# Business Platform Deployment Guide

This guide will help you deploy the Business Platform to your server with SSL certificate and domain configuration.

## Prerequisites

- A server with Ubuntu/Debian
- Domain name pointing to your server
- SSH access to your server
- GitHub repository access

## Server Setup

### 1. Initial Server Configuration

SSH into your server and run the setup script:

```bash
# Download and run the server setup script
curl -fsSL https://raw.githubusercontent.com/codeanyatisone-cmyk/business_platform/main/deploy/server-setup.sh -o server-setup.sh
chmod +x server-setup.sh

# Set your domain and email
export DOMAIN_NAME="your-domain.com"
export EMAIL="your-email@example.com"

# Run the setup
./server-setup.sh
```

### 2. Configure Environment Variables

```bash
cd /opt/business-project

# Copy the environment template
cp .env.example .env

# Edit the environment file
nano .env
```

Update the following values in `.env`:

```env
# Database
POSTGRES_PASSWORD=your_secure_password_here

# JWT Configuration
SECRET_KEY=your_very_secure_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Docker Images (will be set by CI/CD)
BACKEND_IMAGE=ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest
FRONTEND_IMAGE=ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest
```

### 3. Set Up SSL Certificate

```bash
cd /opt/business-project

# Update domain name in scripts
sed -i "s/business.example.com/your-domain.com/g" setup-ssl.sh
sed -i "s/admin@example.com/your-email@example.com/g" setup-ssl.sh

# Run SSL setup
./setup-ssl.sh
```

### 4. Start the Application

```bash
cd /opt/business-project

# Start the application
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## GitHub Actions CI/CD Setup

### 1. Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `SERVER_HOST`: Your server IP address or domain
- `SERVER_USER`: SSH username (usually `root` or your user)
- `SERVER_SSH_KEY`: Your private SSH key
- `SERVER_PORT`: SSH port (default: 22)

### 2. Enable GitHub Container Registry

1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions", select "Read and write permissions"
4. Check "Allow GitHub Actions to create and approve pull requests"

### 3. Push to Trigger Deployment

```bash
# Make any changes and push to main branch
git add .
git commit -m "Update application"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Run tests
2. Build Docker images
3. Push to GitHub Container Registry
4. Deploy to your server

## Manual Deployment

If you need to deploy manually:

```bash
cd /opt/business-project

# Pull latest images
docker pull ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest
docker pull ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest

# Update environment with new image tags
export BACKEND_IMAGE="ghcr.io/codeanyatisone-cmyk/business_platform-backend:latest"
export FRONTEND_IMAGE="ghcr.io/codeanyatisone-cmyk/business_platform-frontend:latest"

# Deploy
./deploy.sh
```

## SSL Certificate Renewal

SSL certificates are automatically renewed via cron job. To manually renew:

```bash
cd /opt/business-project
./renew-ssl.sh
```

## Monitoring and Maintenance

### Check Application Status

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs backend
docker compose logs frontend
docker compose logs nginx

# Check health endpoints
curl https://your-domain.com/health
curl https://your-domain.com/api/v1/test/health
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U postgres business_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U postgres business_platform < backup_file.sql
```

### Update Application

The application will automatically update when you push to the main branch. For manual updates:

```bash
cd /opt/business-project
git pull origin main
./deploy.sh
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew manually
   ./renew-ssl.sh
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker compose logs [service-name]
   
   # Restart specific service
   docker compose restart [service-name]
   ```

3. **Database Connection Issues**
   ```bash
   # Check database logs
   docker compose logs postgres
   
   # Test connection
   docker compose exec postgres psql -U postgres -d business_platform
   ```

4. **Nginx Configuration Issues**
   ```bash
   # Test nginx configuration
   docker compose exec nginx nginx -t
   
   # Reload nginx
   docker compose exec nginx nginx -s reload
   ```

### Log Locations

- Application logs: `docker compose logs`
- SSL renewal logs: `/opt/business-project/ssl-renewal.log`
- Nginx logs: `docker compose logs nginx`

## Security Considerations

1. **Change default passwords** in the `.env` file
2. **Use strong secret keys** for JWT tokens
3. **Regularly update** Docker images and system packages
4. **Monitor logs** for suspicious activity
5. **Backup regularly** your database and configuration

## Support

For issues and questions:
1. Check the logs first
2. Review this deployment guide
3. Check GitHub Issues for known problems
4. Create a new issue if needed

---

Your Business Platform should now be running at `https://your-domain.com`! 🎉
