# 🎫 Система Приглашений в Компанию

## 📋 Обзор Новой Логики

### Изменения в Системе:

**Раньше:**
- Пользователь регистрировался сразу в компании
- Компания создавалась автоматически при регистрации

**Теперь:**
- ✅ Каждый пользователь регистрируется **самостоятельно** и существует независимо
- ✅ Компания и админ компании **приглашают** пользователей
- ✅ Админ компании может назначать роли (employee, manager, admin)
- ✅ Админ компании управляет отделами, досками и задачами

---

## 🏗️ Архитектура

### Модели Данных:

#### 1. **User** (Пользователь)
```python
- id
- email (unique)
- username (unique)
- hashed_password
- role (system role)
- is_active
- is_verified
- owned_companies  # Компании, которыми владеет
```

#### 2. **Company** (Компания)
```python
- id
- name
- description
- owner_id  # Владелец компании (User)
- is_active
- invitations  # Приглашения в компанию
```

#### 3. **CompanyInvitation** (Приглашение)
```python
- id
- email  # Email приглашаемого
- company_id
- department_id (optional)
- invited_by_id  # Кто пригласил
- user_id (заполняется после принятия)
- role  # employee, manager, admin
- position  # Должность
- status  # PENDING, ACCEPTED, DECLINED, EXPIRED
- invitation_token  # Уникальный токен
- expires_at  # Срок действия (7 дней)
```

#### 4. **Employee** (Сотрудник)
```python
- id
- user_id  # Связь с User
- company_id
- department_id
- role  # employee, manager, admin (роль в компании)
- position
- is_active
```

---

## 🔄 Процесс Работы

### 1. Регистрация Пользователя

```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Результат:**
- Создается User
- Пользователь может войти в систему
- Пользователь **НЕ** привязан ни к какой компании

---

### 2. Создание Компании

Пользователь может создать свою компанию:

```http
POST /api/v1/companies
{
  "name": "My Company",
  "description": "Company description"
}
```

**Результат:**
- Создается Company с owner_id = current_user.id
- Создается Employee для владельца с role = "admin"
- Владелец становится администратором компании

---

### 3. Приглашение Пользователей

**Кто может приглашать:**
- Владелец компании (owner)
- Администраторы компании (role = "admin")

```http
POST /api/v1/invitations/create
{
  "email": "newuser@example.com",
  "company_id": 1,
  "department_id": 2,
  "role": "employee",  // employee, manager, admin
  "position": "Frontend Developer"
}
```

**Результат:**
- Создается CompanyInvitation
- Генерируется уникальный invitation_token
- Устанавливается expires_at (7 дней)
- Отправляется email с приглашением (TODO)

---

### 4. Просмотр Приглашений

Пользователь может просмотреть свои приглашения:

```http
GET /api/v1/invitations/my-invitations
```

**Ответ:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "company_id": 1,
    "company_name": "My Company",
    "department_id": 2,
    "department_name": "Development",
    "role": "employee",
    "position": "Frontend Developer",
    "status": "pending",
    "invitation_token": "abc123...",
    "expires_at": "2025-10-31T12:00:00Z",
    "created_at": "2025-10-24T12:00:00Z"
  }
]
```

---

### 5. Принятие Приглашения

```http
POST /api/v1/invitations/accept
{
  "invitation_token": "abc123..."
}
```

**Результат:**
- Создается Employee с привязкой к User
- Статус приглашения меняется на ACCEPTED
- Пользователь становится сотрудником компании
- Назначается роль и отдел из приглашения

---

### 6. Отклонение Приглашения

```http
POST /api/v1/invitations/decline/{invitation_id}
```

**Результат:**
- Статус приглашения меняется на DECLINED

---

## 👥 Роли в Компании

### Employee (Сотрудник)
- Просмотр задач
- Создание задач
- Работа с назначенными задачами
- Просмотр досок

### Manager (Менеджер)
- Все права Employee
- Управление задачами в своем отделе
- Назначение задач сотрудникам
- Создание досок

### Admin (Администратор)
- Все права Manager
- **Приглашение пользователей**
- **Создание и удаление отделов**
- **Управление досками**
- **Управление задачами всей компании**
- Изменение ролей сотрудников

### Owner (Владелец)
- Все права Admin
- Передача владения компанией
- Удаление компании
- Управление администраторами

---

## 🔐 Права Доступа

### Приглашение Пользователей
✅ Owner
✅ Admin
❌ Manager
❌ Employee

### Управление Отделами
✅ Owner
✅ Admin
❌ Manager
❌ Employee

### Управление Досками
✅ Owner
✅ Admin
✅ Manager (только свои)
❌ Employee

### Управление Задачами
✅ Owner (все задачи)
✅ Admin (все задачи)
✅ Manager (задачи своего отдела)
✅ Employee (свои задачи)

---

## 📊 API Endpoints

### Приглашения

#### Создать приглашение
```http
POST /api/v1/invitations/create
```

#### Мои приглашения
```http
GET /api/v1/invitations/my-invitations
```

#### Принять приглашение
```http
POST /api/v1/invitations/accept
```

#### Отклонить приглашение
```http
POST /api/v1/invitations/decline/{invitation_id}
```

#### Приглашения компании
```http
GET /api/v1/invitations/company/{company_id}/invitations
```

---

### Компании

#### Создать компанию
```http
POST /api/v1/companies
```

#### Получить мои компании
```http
GET /api/v1/companies/my-companies
```

#### Обновить компанию
```http
PUT /api/v1/companies/{company_id}
```

---

### Отделы

#### Создать отдел
```http
POST /api/v1/departments
```

#### Получить отделы компании
```http
GET /api/v1/departments/company/{company_id}
```

#### Обновить отдел
```http
PUT /api/v1/departments/{department_id}
```

#### Удалить отдел
```http
DELETE /api/v1/departments/{department_id}
```

---

### Сотрудники

#### Получить сотрудников компании
```http
GET /api/v1/employees/company/{company_id}
```

#### Обновить роль сотрудника
```http
PUT /api/v1/employees/{employee_id}/role
```

#### Удалить сотрудника из компании
```http
DELETE /api/v1/employees/{employee_id}
```

---

## 🔄 Миграция Существующих Данных

При обновлении системы:

1. Все существующие компании получат owner_id
2. Первый пользователь компании станет владельцем
3. Все сотрудники получат role = "employee"
4. Можно вручную назначить администраторов

---

## ✅ Преимущества Новой Системы

1. **Гибкость:** Пользователь может быть в нескольких компаниях
2. **Контроль:** Админ контролирует, кто может присоединиться
3. **Безопасность:** Приглашения с ограниченным сроком действия
4. **Масштабируемость:** Легко добавлять новых пользователей
5. **Прозрачность:** Четкая система ролей и прав

---

## 🚀 Следующие Шаги

- [ ] Email уведомления о приглашениях
- [ ] Массовое приглашение пользователей
- [ ] Импорт пользователей из CSV
- [ ] История приглашений
- [ ] Автоматическое напоминание о приглашениях
- [ ] Шаблоны приглашений

---

## 📝 Примеры Использования

### Пример 1: Создание Компании и Приглашение Команды

```python
# 1. Пользователь регистрируется
POST /api/v1/auth/register
{
  "email": "ceo@company.com",
  "username": "ceo",
  "password": "password123"
}

# 2. Создает компанию
POST /api/v1/companies
{
  "name": "Tech Startup",
  "description": "Innovative tech company"
}

# 3. Приглашает сотрудников
POST /api/v1/invitations/create
{
  "email": "developer@example.com",
  "company_id": 1,
  "role": "employee",
  "position": "Senior Developer"
}

# 4. Приглашает менеджера
POST /api/v1/invitations/create
{
  "email": "manager@example.com",
  "company_id": 1,
  "role": "manager",
  "position": "Project Manager"
}
```

### Пример 2: Принятие Приглашения

```python
# 1. Пользователь регистрируется
POST /api/v1/auth/register
{
  "email": "developer@example.com",
  "username": "developer",
  "password": "password123"
}

# 2. Просматривает приглашения
GET /api/v1/invitations/my-invitations

# 3. Принимает приглашение
POST /api/v1/invitations/accept
{
  "invitation_token": "abc123..."
}

# 4. Теперь является сотрудником компании
GET /api/v1/employees/me
```

---

🎉 **Система приглашений готова к использованию!**

