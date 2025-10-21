# 🚀 Быстрый старт Business Platform

## Текущий статус

✅ **Готово:**
- Установлен Supabase клиент
- Создан API-слой для всех операций
- Готова схема базы данных
- Интегрировано с React Context
- Настроено переключение между mock и реальными данными

⏳ **В процессе:**
- Настройка аутентификации (следующий шаг)

## Два режима работы

### 1️⃣ Режим Mock Data (по умолчанию)

Сейчас приложение работает в режиме моковых данных. Это безопасно и позволяет разрабатывать без подключения к БД.

```bash
# Запустить в режиме mock data
npm start
```

### 2️⃣ Режим Supabase (реальная БД)

Когда вы настроите Supabase, приложение будет работать с реальной базой данных.

## 📋 Как переключиться на Supabase

### Шаг 1: Создайте файл .env

В корне `business-platform/` создайте файл `.env`:

```bash
# Mock mode (сейчас)
REACT_APP_USE_MOCK_DATA=true

# Когда настроите Supabase:
# REACT_APP_USE_MOCK_DATA=false
# REACT_APP_SUPABASE_URL=https://your-project.supabase.co
# REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Шаг 2: Следуйте инструкции

Откройте файл `SUPABASE_SETUP.md` - там подробная пошаговая инструкция по настройке Supabase.

### Шаг 3: Переключитесь на Supabase

После настройки Supabase:

1. Обновите `.env`:
   ```env
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Перезапустите приложение:
   ```bash
   npm start
   ```

## 🎯 Что уже работает

### API готовы для:

- ✅ **Задачи (Tasks)** - создание, редактирование, удаление, перемещение
- ✅ **Сотрудники (Employees)** - CRUD операции
- ✅ **Финансы (Transactions)** - CRUD операции
- ⏳ База знаний - в разработке
- ⏳ Академия - в разработке

### Автоматическое переключение

Приложение автоматически определяет режим работы:

```typescript
// В Mock режиме - данные хранятся локально
if (REACT_APP_USE_MOCK_DATA === 'true') {
  // Используются моковые данные
}

// В Supabase режиме - данные в БД
else {
  // Реальные API запросы к Supabase
}
```

## 🔧 Структура проекта

```
business-platform/
├── src/
│   ├── config/
│   │   └── supabase.ts           # Конфигурация Supabase
│   ├── services/
│   │   └── api/
│   │       ├── tasks.api.ts      # API для задач
│   │       ├── employees.api.ts  # API для сотрудников
│   │       ├── transactions.api.ts # API для финансов
│   │       └── index.ts          # Центральный экспорт
│   ├── hooks/
│   │   └── useAPI.ts             # Хуки для работы с API
│   └── ...
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Схема БД
│       └── 002_seed_data.sql       # Тестовые данные
├── .env                           # Переменные окружения (создайте)
├── SUPABASE_SETUP.md              # Инструкция по настройке
└── GETTING_STARTED.md             # Этот файл
```

## 🛠️ Разработка

### Работа с Mock Data

```typescript
// pages/TasksPage.tsx
import { useTasksAPI } from '../hooks/useAPI';

const { createTask, updateTask, deleteTask } = useTasksAPI();

// Создание задачи
await createTask({
  title: 'Новая задача',
  description: 'Описание',
  // ... другие поля
});

// В Mock режиме - работает с локальным state
// В Supabase режиме - делает API запрос
```

### Добавление нового API

1. Создайте файл в `src/services/api/`:
   ```typescript
   // src/services/api/news.api.ts
   export class NewsAPI {
     static async getAll() { ... }
     static async create() { ... }
   }
   ```

2. Экспортируйте в `index.ts`:
   ```typescript
   export { NewsAPI } from './news.api';
   ```

3. Добавьте хук в `useAPI.ts`:
   ```typescript
   export function useNewsAPI() {
     const { dispatch } = useAppContext();
     // ... CRUD методы
   }
   ```

## 📊 Мониторинг

### Mock режим

В консоли браузера вы увидите:
```
🎭 Loading mock data...
```

### Supabase режим

В консоли браузера вы увидите:
```
🚀 Loading data from Supabase...
✅ Data loaded successfully from Supabase
```

### Ошибки

При проблемах с подключением:
```
❌ Failed to load data: [error message]
```

## 🔐 Безопасность

⚠️ **ВАЖНО:** Никогда не коммитьте `.env` файл!

`.gitignore` уже настроен для игнорирования:
- `.env`
- `.env.local`
- `.env.*.local`

## 🎉 Готово!

Теперь вы можете:

1. **Разрабатывать в Mock режиме** - безопасно и быстро
2. **Переключиться на Supabase** когда будете готовы
3. **Добавлять новые API** по аналогии с существующими

---

Нужна помощь? Читайте:
- `SUPABASE_SETUP.md` - настройка Supabase
- `README.md` - общая информация о проекте
- Комментарии в коде - подробные объяснения

