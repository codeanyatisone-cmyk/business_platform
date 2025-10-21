#!/bin/bash

# Repository Setup Helper Script
# This script helps set up the GitHub repository and push the code

set -e

echo "🚀 Business Platform Repository Setup Helper"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project directory."
    exit 1
fi

# Check SSH connection to GitHub
echo "🔐 Testing SSH connection to GitHub..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH authentication to GitHub is working"
else
    echo "❌ SSH authentication failed. Please set up SSH keys."
    echo "   See: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    exit 1
fi

echo ""
echo "📋 Repository Setup Options:"
echo ""
echo "1. Create repository via GitHub Web Interface (Recommended)"
echo "2. Try to create repository via API"
echo "3. Use personal account instead"
echo "4. Manual upload via web interface"
echo "5. Deploy directly to server (skip GitHub)"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🌐 GitHub Web Interface Setup:"
        echo "1. Go to: https://github.com/codeanyatisone-cmyk"
        echo "2. Click 'New repository'"
        echo "3. Name: business_platform"
        echo "4. Description: Business Platform with JWT auth and Docker setup"
        echo "5. Make it Public or Private"
        echo "6. DON'T initialize with README, .gitignore, or license"
        echo "7. Click 'Create repository'"
        echo ""
        echo "After creating the repository, run:"
        echo "git push -u origin main"
        ;;
    2)
        echo ""
        echo "🔧 Attempting to create repository via API..."
        
        # Check if we have a GitHub token or can use gh
        if command -v gh &> /dev/null; then
            gh repo create codeanyatisone-cmyk/business_platform --public --description "Business Platform with JWT auth and Docker setup"
            git push -u origin main
        else
            echo "❌ GitHub CLI not available. Please install it or use option 1."
            echo "   Install: https://cli.github.com/"
        fi
        ;;
    3)
        echo ""
        echo "👤 Switching to personal account..."
        CURRENT_USER=$(ssh -T git@github.com 2>&1 | grep -o "Hi [^!]*" | cut -d' ' -f2)
        echo "Current GitHub user: $CURRENT_USER"
        
        git remote set-url origin git@github.com:$CURRENT_USER/business_platform.git
        
        echo "Creating repository for user: $CURRENT_USER"
        if command -v gh &> /dev/null; then
            gh repo create $CURRENT_USER/business_platform --public --description "Business Platform with JWT auth and Docker setup"
            git push -u origin main
        else
            echo "Please create the repository manually at:"
            echo "https://github.com/$CURRENT_USER"
            echo "Then run: git push -u origin main"
        fi
        ;;
    4)
        echo ""
        echo "📤 Manual Upload Instructions:"
        echo "1. Create repository at: https://github.com/codeanyatisone-cmyk"
        echo "2. Name: business_platform"
        echo "3. Go to the repository page"
        echo "4. Click 'uploading an existing file'"
        echo "5. Drag and drop all files from this directory"
        echo "6. Commit the upload"
        echo ""
        echo "Current directory contents:"
        ls -la
        ;;
    5)
        echo ""
        echo "🚀 Direct Server Deployment:"
        echo "1. Upload files to your server:"
        echo "   scp -r . your-server:/opt/business-project/"
        echo ""
        echo "2. SSH into your server and run:"
        echo "   cd /opt/business-project"
        echo "   chmod +x quick-deploy.sh"
        echo "   export DOMAIN_NAME='your-domain.com'"
        echo "   export EMAIL='your-email@example.com'"
        echo "   ./quick-deploy.sh"
        echo ""
        echo "This will automatically:"
        echo "- Install Docker, Nginx, Certbot"
        echo "- Set up SSL certificates"
        echo "- Deploy the application"
        echo "- Configure auto-renewal"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-5."
        exit 1
        ;;
esac

echo ""
echo "📋 Current Git Status:"
git status --short

echo ""
echo "📋 Remote Configuration:"
git remote -v

echo ""
echo "✅ Setup instructions provided!"
echo "   Your Business Platform is ready for deployment! 🚀"
