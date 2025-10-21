-- Тестовые данные для разработки
-- Запускайте только в development окружении!

-- Вставка тестовых сотрудников
INSERT INTO employees (name, position, department, avatar, email, phone, hire_date, birth_date, status, salary, schedule, hr) VALUES
('Алишер Билалов', 'Владелец', 'Владельцы', 'https://ui-avatars.com/api/?name=Alisher+Bilalov&background=f44336&color=fff', 'alisher@company.com', '+7 (999) 123-45-67', '2025-07-23', '1990-07-23', 'active', 150000, 'Полный день', 'Владислава Полякова'),
('Сергей Кондратьев', 'Владелец', 'Владельцы', 'https://ui-avatars.com/api/?name=Sergey+Kondratiev&background=4caf50&color=fff', 'sergey@company.com', NULL, '2025-07-23', '1989-08-02', 'active', 150000, 'Полный день', 'Владислава Полякова'),
('Кирилл Коростелев', 'Генеральный директор', 'Генеральный директор', 'https://ui-avatars.com/api/?name=Kirill+Korostelev&background=ff9800&color=fff', 'kirill@company.com', NULL, '2025-07-23', '1997-05-27', 'active', 120000, 'Полный день', 'Владислава Полякова'),
('Ольга Ш.', 'Бухгалтер', 'Департамент бухгалтерии', 'https://ui-avatars.com/api/?name=Olga+S&background=2196f3&color=fff', 'olga@company.com', NULL, '2025-07-24', '1985-07-24', 'active', 80000, 'Полный день', 'Владислава Полякова'),
('Владислава Полякова', 'Ассистент генерального директора', 'HR департамент', 'https://ui-avatars.com/api/?name=Vladislava+Polyakova&background=9c27b0&color=fff', 'vladislava@company.com', NULL, '2025-07-25', '1992-07-25', 'active', 90000, 'Полный день', 'Владислава Полякова');

-- Вставка тестовых задач
INSERT INTO tasks (title, description, status, priority, assignee_id, creator_id, due_date) VALUES
('Отправить материалы Кириллу', 'сегментирование из Bridges, материалы по офферам из персональной базы знаний, табличку ССП', 'new', 2, 1, 3, '2024-12-15'),
('Согласование регламента "О предпроектной подготовке"', '', 'new', 1, 2, 3, NULL),
('Разработать простую инструкцию + шаблон по составлению минимального КП', 'Инструкция должна быть понятной для новых сотрудников', 'inProgress', 3, 1, 3, '2024-12-20'),
('Создать договор на оказание услуги, включающую элементы бизнес-модели', '', 'new', 2, 1, 3, NULL),
('Согласовать 20 контактов из event-агентства', 'Назначить встречи в ближайшее время', 'review', 3, 1, 3, '2024-12-10');

-- Вставка тестовых транзакций
INSERT INTO transactions (type, category, amount, currency, description, date, account, created_by_id, counterparty, project) VALUES
('income', 'Доходы от услуг', 850000, 'KZT', 'Оплата за консультационные услуги - ТОО "Аманат"', '2024-12-01', 'Основной расчетный счет', 4, 'ТОО "Аманат"', 'Консалтинг Q4'),
('expense', 'Зарплаты', 420000, 'KZT', 'Выплата заработной платы за ноябрь 2024', '2024-12-05', 'Основной расчетный счет', 4, 'Сотрудники', NULL),
('expense', 'Аренда', 300000, 'KZT', 'Аренда офиса за декабрь 2024', '2024-12-01', 'Основной расчетный счет', 5, 'ТОО "БизнесЦентр"', NULL),
('income', 'Доходы от услуг', 1200000, 'KZT', 'Оплата за разработку стратегии - ИП Садыков', '2024-12-03', 'Основной расчетный счет', 4, 'ИП Садыков А.К.', 'Стратегия развития'),
('expense', 'Маркетинг', 150000, 'KZT', 'Контекстная реклама Google Ads', '2024-12-02', 'Основной расчетный счет', 1, 'Google Ireland Ltd', NULL);

-- Вставка тестовых счетов
INSERT INTO accounts (name, currency, balance, type, description) VALUES
('Основной расчетный счет', 'KZT', 5250000, 'bank', 'Банк Центр Кредит'),
('Валютный счет USD', 'USD', 12500, 'bank', 'Halyk Bank'),
('Касса', 'KZT', 150000, 'cash', 'Операционная касса офиса'),
('Резервный счет', 'RUB', 250000, 'bank', 'Сбербанк РФ');

-- Вставка тестовой базы знаний
INSERT INTO knowledge_folders (title, description, created_by) VALUES
('Документация', 'Техническая документация и руководства', 'Кирилл Коростелев'),
('Процессы', 'Бизнес-процессы компании', 'Кирилл Коростелев'),
('HR', 'HR документы и политики', 'Владислава Полякова');

INSERT INTO knowledge_articles (title, content, category, folder_id, author, author_id, views) VALUES
('Руководство по работе с CRM', 'Подробное руководство по использованию CRM системы...', 'Инструкции', 1, 'Кирилл Коростелев', 3, 45),
('Политика отпусков', 'Правила предоставления отпусков сотрудникам...', 'HR', 3, 'Владислава Полякова', 5, 23),
('Процесс адаптации новых сотрудников', 'Пошаговый процесс онбординга новых членов команды...', 'Процессы', 2, 'Владислава Полякова', 5, 67);

-- Вставка тестовых курсов
INSERT INTO courses (title, description, author, author_id, participants, views, status, category) VALUES
('Основы проектного управления', 'Комплексный курс по управлению проектами для начинающих менеджеров', 'Кирилл Коростелев', 3, ARRAY[1, 2, 5]::bigint[], 156, 'active', 'Менеджмент'),
('Финансовая грамотность для руководителей', 'Базовые знания финансов для эффективного управления бюджетами', 'Ольга Ш.', 4, ARRAY[1, 3, 5]::bigint[], 89, 'active', 'Финансы');

INSERT INTO lessons (course_id, title, content, order_number, duration) VALUES
(1, 'Введение в проектное управление', 'Основные концепции и термины PM...', 1, 30),
(1, 'Методология Agile', 'Принципы гибкой разработки...', 2, 45),
(1, 'Управление рисками', 'Идентификация и митигация рисков проекта...', 3, 40);

-- Вставка тестовой программы
INSERT INTO programs (title, description, participants, course_ids, created_by) VALUES
('Программа развития менеджеров', 'Комплексная программа для развития управленческих навыков', ARRAY[1, 2, 5]::bigint[], ARRAY[1, 2]::bigint[], 'Кирилл Коростелев');

-- Проверка вставленных данных
SELECT 'Employees:' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'Tasks:', COUNT(*) FROM tasks
UNION ALL
SELECT 'Transactions:', COUNT(*) FROM transactions
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM accounts
UNION ALL
SELECT 'Knowledge Folders:', COUNT(*) FROM knowledge_folders
UNION ALL
SELECT 'Knowledge Articles:', COUNT(*) FROM knowledge_articles
UNION ALL
SELECT 'Courses:', COUNT(*) FROM courses;

