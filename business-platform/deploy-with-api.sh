#!/bin/bash

# Frontend deployment script with production API
set -e

SERVER="my-server"
REMOTE_DIR="/root/business-platform"
BACKEND_URL="http://188.244.115.197:3001/api/v1"

echo "🚀 Building frontend with production API..."

# Update AuthContext to use production API
echo "📝 Configuring production API URL..."
cat > src/config/api.config.ts << EOF
// Production API Configuration
export const API_CONFIG = {
  baseURL: '${BACKEND_URL}',
  timeout: 10000,
  withCredentials: false,
};

// Check if we're in production
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const USE_MOCK_DATA = false; // Always use real API in production

console.log('🔧 API Configuration:', {
  baseURL: API_CONFIG.baseURL,
  isProduction: IS_PRODUCTION,
  useMockData: USE_MOCK_DATA
});
EOF

# Update axios.config.ts to use production API
cat > src/services/api/axios.config.ts << 'EOF'
import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';

// Создаем настроенный axios instance
export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: API_CONFIG.withCredentials,
});

// Автоматически добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек - выходим
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
EOF

# Update AuthContext to not use mock data
sed -i '' 's/const USE_MOCK_DATA = !API_URL.*/const USE_MOCK_DATA = false;/g' src/contexts/AuthContext.tsx || true

# Update useAPI.ts
sed -i '' 's/const USE_MOCK_DATA = !API_URL.*/const USE_MOCK_DATA = false;/g' src/hooks/useAPI.ts || true

echo "🏗️  Building production bundle..."
npm run build

echo "📤 Uploading to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env' \
  ./ $SERVER:$REMOTE_DIR/

# Deploy on server
ssh $SERVER << 'ENDSSH'
cd /root/business-platform

# Stop and restart containers
docker compose down || true
docker compose up -d --build

echo "✅ Frontend deployment completed!"
ENDSSH

echo ""
echo "✨ Deployment finished!"
echo "🌐 Your application is available at:"
echo "   - https://anyatis.com"
echo "   - Backend API: http://188.244.115.197:3001/api/v1"






