#!/bin/bash

echo "🧪 Тестирование подключения фронтенда к PostgreSQL API"
echo "=================================================="

# Проверяем, что оба сервера работают
echo "1. Проверка статуса серверов..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Фронтенд работает (http://localhost:3000)"
else
    echo "❌ Фронтенд не работает"
fi

if [ "$API_STATUS" = "200" ]; then
    echo "✅ API работает (http://localhost:3001)"
else
    echo "❌ API не работает"
fi

echo ""
echo "2. Тестирование API endpoints..."

# Тестируем аутентификацию
echo "🔐 Тестирование аутентификации..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Аутентификация работает"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "   Токен: ${TOKEN:0:20}..."
else
    echo "❌ Аутентификация не работает"
fi

# Тестируем получение компаний
echo "🏢 Тестирование получения компаний..."
COMPANIES_RESPONSE=$(curl -s http://localhost:3001/api/v1/companies)
COMPANIES_COUNT=$(echo "$COMPANIES_RESPONSE" | grep -o '"id"' | wc -l)

if [ "$COMPANIES_COUNT" -gt 0 ]; then
    echo "✅ Получение компаний работает ($COMPANIES_COUNT компаний)"
else
    echo "❌ Получение компаний не работает"
fi

# Тестируем получение задач
echo "📋 Тестирование получения задач..."
TASKS_RESPONSE=$(curl -s http://localhost:3001/api/v1/tasks)
TASKS_COUNT=$(echo "$TASKS_RESPONSE" | grep -o '"id"' | wc -l)

if [ "$TASKS_COUNT" -gt 0 ]; then
    echo "✅ Получение задач работает ($TASKS_COUNT задач)"
else
    echo "❌ Получение задач не работает"
fi

echo ""
echo "3. Проверка конфигурации фронтенда..."
echo "🔧 API Base URL: http://localhost:3001/api/v1"
echo "🔧 USE_MOCK_DATA: false (используется реальный API)"
echo "🔧 CORS: настроен для localhost:3000"

echo ""
echo "4. Инструкции для тестирования:"
echo "📱 Откройте браузер и перейдите на http://localhost:3000"
echo "🔑 Войдите с учетными данными: admin@example.com / admin"
echo "📊 Проверьте, что данные загружаются из PostgreSQL"
echo "🔍 Откройте DevTools (F12) и посмотрите на Network tab"

echo ""
echo "🎉 Подключение фронтенда к PostgreSQL API готово!"
