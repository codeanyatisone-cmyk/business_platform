-- Business Platform Database Schema
-- Создано для Supabase

-- Enable необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица сотрудников
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  avatar TEXT NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  hire_date DATE NOT NULL,
  birth_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'terminated')),
  salary DECIMAL(12, 2),
  schedule VARCHAR(100) NOT NULL,
  recruiter VARCHAR(255),
  hr VARCHAR(255),
  termination_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица задач
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  product TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('new', 'inProgress', 'review', 'completed', 'postponed')),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 4),
  assignee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  creator_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  due_date DATE,
  tags TEXT[],
  category VARCHAR(100),
  parent_task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица чеклистов для задач
CREATE TABLE IF NOT EXISTS task_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица комментариев к задачам
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  changes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица транзакций (финансы)
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KZT', 'USD', 'RUB', 'EUR')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  project VARCHAR(255),
  counterparty VARCHAR(255),
  account VARCHAR(255) NOT NULL,
  created_by_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица счетов
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('KZT', 'USD', 'RUB', 'EUR')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  type VARCHAR(20) NOT NULL CHECK (type IN ('bank', 'cash', 'card')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица базы знаний - папки
CREATE TABLE IF NOT EXISTS knowledge_folders (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES knowledge_folders(id) ON DELETE CASCADE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица базы знаний - статьи
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  folder_id BIGINT REFERENCES knowledge_folders(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  author VARCHAR(255) NOT NULL,
  author_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица курсов (академия)
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
  participants BIGINT[],
  views INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'draft')),
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица уроков курсов
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  order_number INTEGER NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица программ обучения
CREATE TABLE IF NOT EXISTS programs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  participants BIGINT[],
  course_ids BIGINT[],
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица новостей
CREATE TABLE IF NOT EXISTS news (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  image TEXT,
  category VARCHAR(100) NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица комментариев к новостям
CREATE TABLE IF NOT EXISTS news_comments (
  id BIGSERIAL PRIMARY KEY,
  news_id BIGINT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_folder ON knowledge_articles(folder_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_parent ON knowledge_folders(parent_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - включается после настройки аутентификации
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- и т.д.

COMMENT ON TABLE employees IS 'Таблица сотрудников компании';
COMMENT ON TABLE tasks IS 'Таблица задач с Kanban-board';
COMMENT ON TABLE transactions IS 'Таблица финансовых транзакций';
COMMENT ON TABLE knowledge_articles IS 'База знаний - статьи';
COMMENT ON TABLE courses IS 'Академия - курсы обучения';

