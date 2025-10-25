# ER Диаграмма Business Platform Database (Mermaid)

```mermaid
erDiagram
    %% Основные сущности
    Company {
        int id PK
        string name
        text description
        string website
        string email
        string phone
        text address
        string logo_url
        boolean is_active
        string created_at
        string updated_at
    }

    User {
        int id PK
        string email UK
        string username UK
        string hashed_password
        string role
        boolean is_active
        boolean is_verified
        string last_login
        string created_at
        string updated_at
    }

    Employee {
        int id PK
        string first_name
        string last_name
        string middle_name
        string email UK
        string phone
        string position
        string avatar_url
        string birth_date
        string hire_date
        float salary
        boolean is_active
        int company_id FK
        int department_id FK
        int user_id FK
        string created_at
        string updated_at
    }

    Department {
        int id PK
        string name
        text description
        int company_id FK
        int parent_id FK
        int manager_id FK
        boolean is_active
        string created_at
        string updated_at
    }

    %% Управление задачами
    Task {
        int id PK
        string title
        text description
        string status
        string priority
        float estimated_hours
        float actual_hours
        string due_date
        string completed_at
        text tags
        text checklist
        boolean is_favorite
        boolean is_archived
        int company_id FK
        int creator_id FK
        int assignee_id FK
        int sprint_id FK
        int epic_id FK
        string created_at
        string updated_at
    }

    Sprint {
        int id PK
        string name
        text description
        string start_date
        string end_date
        text goal
        boolean is_active
        boolean is_completed
        int company_id FK
        string created_at
        string updated_at
    }

    Epic {
        int id PK
        string name
        text description
        string color
        int company_id FK
        string created_at
        string updated_at
    }

    TaskComment {
        int id PK
        text content
        int task_id FK
        int author_id FK
        string created_at
        string updated_at
    }

    TimeLog {
        int id PK
        text description
        float hours
        string logged_date
        int task_id FK
        int employee_id FK
        string created_at
    }

    %% Финансы
    Account {
        int id PK
        string name
        string account_type
        float balance
        string currency
        boolean is_active
        int company_id FK
        string created_at
        string updated_at
    }

    Transaction {
        int id PK
        float amount
        text description
        string transaction_type
        string category
        string reference
        int company_id FK
        int account_id FK
        string created_at
        string updated_at
    }

    %% Контент
    NewsItem {
        int id PK
        string title
        text content
        text summary
        string category
        string image_url
        boolean is_published
        int likes_count
        int views_count
        int company_id FK
        int author_id FK
        string created_at
        string updated_at
    }

    NewsComment {
        int id PK
        text content
        int news_id FK
        int author_id FK
        string created_at
        string updated_at
    }

    %% Обучение
    Course {
        int id PK
        string title
        text description
        string category
        string status
        float duration_hours
        string image_url
        int company_id FK
        int instructor_id FK
        string created_at
        string updated_at
    }

    Lesson {
        int id PK
        string title
        text content
        int order
        int duration_minutes
        string video_url
        int course_id FK
        string created_at
        string updated_at
    }

    %% Связующие таблицы
    TaskWatchers {
        int task_id PK
        int employee_id PK
    }

    TaskDependencies {
        int task_id PK
        int depends_on_task_id PK
    }

    %% Основные связи
    Company ||--o{ Department : "has"
    Company ||--o{ Employee : "employs"
    Company ||--o{ Task : "contains"
    Company ||--o{ Sprint : "has"
    Company ||--o{ Epic : "has"
    Company ||--o{ Account : "owns"
    Company ||--o{ Transaction : "has"
    Company ||--o{ NewsItem : "publishes"
    Company ||--o{ Course : "offers"

    User ||--o| Employee : "is"
    
    Department ||--o{ Employee : "contains"
    Department ||--o{ Department : "parent_of"
    Department ||--o| Employee : "managed_by"

    Employee ||--o{ Task : "creates"
    Employee ||--o{ Task : "assigned_to"
    Employee ||--o{ TaskComment : "writes"
    Employee ||--o{ TimeLog : "logs"
    Employee ||--o{ NewsItem : "authors"
    Employee ||--o{ NewsComment : "writes"
    Employee ||--o{ Course : "instructs"

    Task ||--o{ TaskComment : "has"
    Task ||--o{ TimeLog : "tracks"
    Task }o--o{ Employee : "watched_by"
    Task }o--o{ Task : "depends_on"

    Sprint ||--o{ Task : "contains"
    Epic ||--o{ Task : "groups"

    Account ||--o{ Transaction : "records"

    NewsItem ||--o{ NewsComment : "has"

    Course ||--o{ Lesson : "contains"

    %% Связи для связующих таблиц
    Task ||--o{ TaskWatchers : "watched_by"
    Employee ||--o{ TaskWatchers : "watches"
    Task ||--o{ TaskDependencies : "depends_on"
    Task ||--o{ TaskDependencies : "dependency_for"
```

## Описание диаграммы

Эта ER диаграмма показывает полную структуру базы данных Business Platform с мультитенантной архитектурой.

### Основные сущности:
- **Company** - центральная сущность мультитенантной архитектуры
- **User** - система аутентификации (связана 1:1 с Employee)
- **Employee** - основная рабочая единица
- **Department** - иерархическая структура отделов

### Управление задачами:
- **Task** - задачи с статусами, приоритетами, зависимостями
- **Sprint** - итерации разработки
- **Epic** - крупные функциональности
- **TaskComment**, **TimeLog** - комментарии и учет времени

### Финансы:
- **Account** - финансовые счета компании
- **Transaction** - доходы, расходы, переводы

### Контент и обучение:
- **NewsItem**, **NewsComment** - корпоративные новости
- **Course**, **Lesson** - обучающие программы

### Связующие таблицы:
- **TaskWatchers** - наблюдатели задач (many-to-many)
- **TaskDependencies** - зависимости между задачами (many-to-many)