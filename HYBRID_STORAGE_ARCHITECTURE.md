# 🏗️ Гибридная Архитектура Хранения Данных

## 📋 Обзор

Business Platform использует гибридную архитектуру хранения данных для оптимальной производительности и надежности:

### 🗄️ **PostgreSQL** - ACID-compliant Database
**Назначение**: Критически важные данные с гарантиями ACID

**Что хранится**:
- 👥 Пользователи и сотрудники
- 🏢 Компании и отделы
- ✅ Задачи и проекты
- 💰 Финансовые транзакции
- 📚 База знаний и курсы
- 📰 Новости и комментарии
- 🔐 Пароли (зашифрованные)

**Преимущества**:
- ✅ ACID гарантии (Atomicity, Consistency, Isolation, Durability)
- ✅ Сложные транзакции
- ✅ Реляционные связи
- ✅ SQL запросы и индексы
- ✅ Резервное копирование

---

### 🔴 **Redis** - In-Memory Cache & Session Store
**Назначение**: Кэширование и управление сессиями

**Что хранится**:
- 🔄 Кэш запросов к базе данных
- 👤 Данные пользователей (кэш)
- 📋 Списки задач (кэш)
- 🎫 Сессии пользователей
- ⚡ Временные данные
- 🔔 Очереди уведомлений

**Преимущества**:
- ⚡ Очень быстрый доступ (in-memory)
- ⚡ Снижение нагрузки на PostgreSQL
- ⚡ Автоматическое истечение (TTL)
- ⚡ Pub/Sub для real-time
- ⚡ Поддержка различных структур данных

**Конфигурация**:
```env
REDIS_URL=redis://:redis_password@localhost:6379/0
REDIS_CACHE_TTL=3600  # 1 hour
REDIS_SESSION_TTL=86400  # 24 hours
```

---

### 📦 **MinIO** - S3-Compatible Object Storage
**Назначение**: Файловое хранилище (S3-совместимое)

**Что хранится**:
- 🖼️ Аватары пользователей
- 📄 Документы и файлы
- 📎 Вложения к задачам
- 📧 Вложения к письмам
- 📚 Файлы базы знаний
- 🎓 Материалы курсов
- 📊 Отчеты и экспорты

**Преимущества**:
- 📦 S3-совместимый API
- 📦 Неограниченное масштабирование
- 📦 Версионирование файлов
- 📦 Временные ссылки (presigned URLs)
- 📦 Организация по bucket'ам
- 📦 Репликация и резервное копирование

**Конфигурация**:
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=business-platform
```

---

## 🔧 Архитектурные Решения

### Когда использовать PostgreSQL?
✅ Критически важные данные
✅ Требуются ACID гарантии
✅ Сложные реляционные связи
✅ Транзакции и откаты
✅ Финансовые данные
✅ Аудит и история изменений

### Когда использовать Redis?
✅ Временные данные
✅ Кэширование частых запросов
✅ Сессии пользователей
✅ Счетчики и статистика
✅ Real-time данные
✅ Очереди задач

### Когда использовать MinIO?
✅ Файлы любого размера
✅ Изображения и медиа
✅ Документы и архивы
✅ Резервные копии
✅ Статические ресурсы
✅ Вложения

---

## 🚀 API Endpoints

### Files API (MinIO)

#### Загрузка аватара
```http
POST /api/v1/files/upload/avatar
Content-Type: multipart/form-data

file: <image file>
```

#### Загрузка документа
```http
POST /api/v1/files/upload/document
Content-Type: multipart/form-data

file: <any file>
```

#### Загрузка вложения
```http
POST /api/v1/files/upload/attachment
Content-Type: multipart/form-data

file: <any file>
```

#### Скачать файл
```http
GET /api/v1/files/download/{file_path}
```

#### Удалить файл
```http
DELETE /api/v1/files/delete/{file_path}
```

#### Получить временную ссылку
```http
GET /api/v1/files/url/{file_path}
```

#### Список файлов
```http
GET /api/v1/files/list?prefix=avatars
```

---

## 🔄 Кэширование с Redis

### Пример использования в коде:

```python
from app.services.redis_service import redis_service

# Кэширование данных пользователя
await redis_service.cache_user(user_id, user_data, ttl=3600)

# Получение из кэша
cached_user = await redis_service.get_cached_user(user_id)

# Инвалидация кэша
await redis_service.invalidate_user_cache(user_id)

# Кэширование списка задач
await redis_service.cache_task_list(company_id, tasks)

# Управление сессиями
await redis_service.set_session(session_id, session_data)
session = await redis_service.get_session(session_id)
```

---

## 📦 Работа с MinIO

### Пример использования в коде:

```python
from app.services.minio_service import minio_service
from io import BytesIO

# Загрузка файла
file_data = BytesIO(file_content)
object_name = minio_service.upload_file(
    file_data, 
    "document.pdf", 
    "application/pdf",
    folder="documents"
)

# Скачивание файла
file_content = minio_service.download_file(object_name)

# Получение временной ссылки
url = minio_service.get_presigned_url(object_name)

# Удаление файла
minio_service.delete_file(object_name)

# Проверка существования
exists = minio_service.file_exists(object_name)
```

---

## 🐳 Docker Compose Configuration

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=business_platform
    volumes:
      - bp-pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redis_password
    volumes:
      - bp-redis-data:/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - bp-minio-data:/data
```

---

## 📊 Мониторинг и Метрики

### PostgreSQL
- Размер базы данных
- Количество подключений
- Медленные запросы
- Индексы и производительность

### Redis
- Использование памяти
- Hit/Miss rate кэша
- Количество ключей
- Время отклика

### MinIO
- Использование дискового пространства
- Количество объектов
- Bandwidth (входящий/исходящий)
- Количество запросов

---

## 🔐 Безопасность

### PostgreSQL
- ✅ Шифрование соединений (SSL/TLS)
- ✅ Ограничение доступа по IP
- ✅ Сильные пароли
- ✅ Регулярные резервные копии

### Redis
- ✅ Аутентификация паролем
- ✅ Доступ только из внутренней сети
- ✅ Persistence (AOF/RDB)
- ✅ Шифрование данных

### MinIO
- ✅ Access Key / Secret Key
- ✅ Bucket policies
- ✅ Временные ссылки (presigned URLs)
- ✅ Шифрование объектов
- ✅ Версионирование

---

## 📈 Масштабирование

### PostgreSQL
- Read replicas для чтения
- Connection pooling (PgBouncer)
- Партиционирование таблиц
- Индексы и оптимизация запросов

### Redis
- Redis Cluster для шардинга
- Redis Sentinel для высокой доступности
- Репликация master-slave
- Увеличение памяти

### MinIO
- Distributed mode (несколько узлов)
- Erasure coding для надежности
- Репликация между регионами
- Load balancing

---

## 🎯 Best Practices

1. **Всегда используйте кэш** для часто запрашиваемых данных
2. **Инвалидируйте кэш** при обновлении данных
3. **Используйте TTL** для автоматической очистки
4. **Храните файлы в MinIO**, не в базе данных
5. **Используйте presigned URLs** для безопасного доступа к файлам
6. **Мониторьте производительность** всех компонентов
7. **Делайте резервные копии** регулярно
8. **Используйте транзакции** для критичных операций
9. **Оптимизируйте запросы** с помощью индексов
10. **Логируйте все операции** для аудита

---

## 🔧 Troubleshooting

### Redis не подключается
```bash
# Проверить статус
docker logs bp-redis

# Проверить подключение
redis-cli -h localhost -p 6379 -a redis_password ping
```

### MinIO не доступен
```bash
# Проверить статус
docker logs bp-minio

# Открыть консоль
http://localhost:9001
```

### PostgreSQL медленно работает
```sql
-- Проверить медленные запросы
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Проверить размер базы
SELECT pg_size_pretty(pg_database_size('business_platform'));
```

---

## 📚 Дополнительные Ресурсы

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

## ✅ Checklist для Production

- [ ] PostgreSQL: Настроены резервные копии
- [ ] PostgreSQL: Включено SSL шифрование
- [ ] PostgreSQL: Настроен connection pooling
- [ ] Redis: Включена persistence (AOF)
- [ ] Redis: Настроен strong password
- [ ] Redis: Ограничен доступ по сети
- [ ] MinIO: Настроены bucket policies
- [ ] MinIO: Включено версионирование
- [ ] MinIO: Настроены резервные копии
- [ ] Мониторинг всех сервисов
- [ ] Логирование и аудит
- [ ] Документация обновлена

---

🎉 **Гибридная архитектура готова к использованию!**


