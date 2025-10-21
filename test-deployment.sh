#!/bin/bash

# Test Deployment Script for Business Platform
# This script tests the deployment setup on your server

echo "🚀 Testing Business Platform Deployment Setup"
echo "=============================================="

# Server details
SERVER_HOST="188.244.115.197"
SERVER_USER="root"
DEPLOY_DIR="/opt/business-project"

echo "📋 Server Information:"
echo "  Host: $SERVER_HOST"
echo "  User: $SERVER_USER"
echo "  Deploy Directory: $DEPLOY_DIR"
echo ""

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ssh my-server "echo 'SSH connection successful'"; then
    echo "✅ SSH connection working"
else
    echo "❌ SSH connection failed"
    exit 1
fi

# Check deployment directory
echo ""
echo "📁 Checking deployment directory..."
ssh my-server "ls -la $DEPLOY_DIR"

# Check Docker status
echo ""
echo "🐳 Checking Docker status..."
ssh my-server "docker --version && docker compose version"

# Test Docker Compose file
echo ""
echo "📄 Testing Docker Compose configuration..."
ssh my-server "cd $DEPLOY_DIR && docker compose config"

echo ""
echo "🎯 Next Steps:"
echo "1. Configure GitHub Secrets:"
echo "   - SERVER_HOST: $SERVER_HOST"
echo "   - SERVER_USER: $SERVER_USER"
echo "   - SERVER_SSH_KEY: [Your private SSH key]"
echo "   - SERVER_PORT: 22"
echo ""
echo "2. Push code to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'Test deployment'"
echo "   git push origin main"
echo ""
echo "3. Monitor deployment:"
echo "   https://github.com/codeanyatisone-cmyk/business_platform/actions"
echo ""
echo "✅ Deployment setup is ready!"
