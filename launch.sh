#!/bin/bash

# Business Platform Launch Script
# This script will start the backend and frontend services

echo "🚀 Starting Business Platform with Mailbox Integration..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "fastapi-backend/app/main.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "🔍 Checking requirements..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js/npm is required but not installed"
    exit 1
fi

echo "✅ Requirements check passed"

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd fastapi-backend

# Check if .env exists, if not copy from example
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from example..."
    cp env.example .env
    echo "✅ .env file created. Please update with your actual values if needed."
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -e .

# Run database migrations (if needed)
echo "🗄️  Running database migrations..."
alembic upgrade head

# Start backend in background
echo "🚀 Starting FastAPI backend..."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to project root
cd ..

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."
cd business-platform

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start frontend
echo "🚀 Starting React frontend..."
npm start &
FRONTEND_PID=$!

# Go back to project root
cd ..

echo ""
echo "🎉 Business Platform is starting up!"
echo "=================================================="
echo "📡 Backend API: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "📧 Mailbox Integration: Enabled"
echo "🔑 Mailcow API: https://mail.anyatis.com"
echo ""
echo "📋 Available endpoints:"
echo "  - GET /mailbox/info - Get mailbox information"
echo "  - POST /mailbox/create - Create new mailbox"
echo "  - POST /mailbox/update-password - Update mailbox password"
echo "  - GET /mailbox/webmail-url - Get webmail access"
echo ""
echo "🔧 To create mailboxes for existing users, run:"
echo "  cd fastapi-backend && python bulk_create_mailboxes.py"
echo ""
echo "⏹️  To stop all services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait



