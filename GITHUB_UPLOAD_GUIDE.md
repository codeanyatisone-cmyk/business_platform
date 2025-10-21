# Manual GitHub Upload Guide

Since there are authentication issues with Git, here's how to manually upload your Business Platform to GitHub:

## Option 1: GitHub Web Interface Upload

### 1. Create Repository on GitHub
1. Go to https://github.com/codeanyatisone-cmyk
2. Click "New repository"
3. Name it `business_platform`
4. Make it public or private as needed
5. Don't initialize with README (we have our own)

### 2. Upload Files via Web Interface
1. Go to your new repository
2. Click "uploading an existing file"
3. Drag and drop all files from your project directory
4. Commit the upload

## Option 2: GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
# Authenticate
gh auth login

# Create repository
gh repo create codeanyatisone-cmyk/business_platform --public --description "Business Platform with JWT auth and Docker setup"

# Push code
git push -u origin main
```

## Option 3: Manual File Transfer

### Key Files to Upload:
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `deploy/server-setup.sh` - Server setup script
- `docker-compose.prod.yml` - Production configuration
- `nginx.prod.conf` - Nginx configuration
- `DEPLOYMENT.md` - Deployment guide
- `README.md` - Project documentation
- `.gitignore` - Git ignore rules
- All source code in `business-platform/` and `fastapi-backend/`

## Option 4: Direct Server Deployment

If you prefer to deploy directly without GitHub:

### 1. Upload Files to Server
```bash
# Create project directory on server
ssh your-server "mkdir -p /opt/business-project"

# Upload files using scp
scp -r . your-server:/opt/business-project/
```

### 2. Run Server Setup
```bash
ssh your-server
cd /opt/business-project
chmod +x deploy/server-setup.sh
export DOMAIN_NAME="your-domain.com"
export EMAIL="your-email@example.com"
./deploy/server-setup.sh
```

## Option 5: Docker Hub Deployment

If you want to use Docker Hub instead of GitHub Container Registry:

### 1. Update docker-compose.prod.yml
```yaml
services:
  backend:
    image: your-dockerhub-username/business-platform-backend:latest
  frontend:
    image: your-dockerhub-username/business-platform-frontend:latest
```

### 2. Build and Push Images
```bash
# Build images
docker build -t your-dockerhub-username/business-platform-backend:latest ./fastapi-backend
docker build -t your-dockerhub-username/business-platform-frontend:latest ./business-platform

# Push to Docker Hub
docker push your-dockerhub-username/business-platform-backend:latest
docker push your-dockerhub-username/business-platform-frontend:latest
```

## Quick Start Commands

Once you have the repository set up, here are the essential commands:

### Local Development
```bash
# Start development environment
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Production Deployment
```bash
# On your server
cd /opt/business-project

# Set environment variables
export DOMAIN_NAME="your-domain.com"
export EMAIL="your-email@example.com"

# Run setup
./deploy/server-setup.sh

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Set up SSL
./setup-ssl.sh

# Start application
docker compose up -d
```

## Troubleshooting

### If Repository Access Issues Persist:
1. Check if the repository exists at https://github.com/codeanyatisone-cmyk/business_platform
2. Verify you have write access to the organization
3. Try creating the repository under your personal account instead
4. Use GitHub CLI: `gh auth status` to check authentication

### If SSH Key Issues:
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your-email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys
3. Test: `ssh -T git@github.com`

### Alternative Repository Names:
- `business-platform` (with hyphen)
- `businessplatform` (no separators)
- `corporate-platform`
- `business-management-platform`

## Next Steps After Upload

1. **Configure GitHub Secrets** (if using CI/CD):
   - `SERVER_HOST`: Your server IP
   - `SERVER_USER`: SSH username
   - `SERVER_SSH_KEY`: Private SSH key
   - `SERVER_PORT`: SSH port (22)

2. **Set Up Server**:
   - Run the server setup script
   - Configure SSL certificate
   - Start the application

3. **Test Deployment**:
   - Check health endpoints
   - Verify SSL certificate
   - Test authentication flow

The application is ready to deploy! Choose the method that works best for your setup.
