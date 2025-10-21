// Основные типы для приложения

export interface User {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar: string;
  email?: string;
  phone?: string;
  hireDate: string;
  birthDate: string;
  status: 'active' | 'inactive' | 'terminated';
}

export interface Employee extends User {
  salary?: number;
  schedule: string;
  recruiter?: string;
  hr?: string;
  terminationDate?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  image?: string;
  category: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  avatar: string;
}

export interface Anniversary {
  id: number;
  employee: string;
  position: string;
  type: 'Годовщина' | 'День рождения' | 'Юбилей';
  significance: string;
  eventDate: string;
  hireDate: string;
  birthDate: string;
  avatar: string;
}

export interface Event {
  id: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  date: string; // Основная дата события
  time?: string; // Время события
  description: string;
  employees: string[];
  positions: string[];
}

export interface Absence {
  id: number;
  employeeId: number;
  type: 'vacation' | 'sick' | 'businessTrip' | 'dayOff';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Company {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    departments: number;
    tasks: number;
  };
}

export interface Department {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  managerId?: number;
  parentId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  manager?: Employee;
  parent?: Department;
  children?: Department[];
  _count?: {
    employees: number;
    children: number;
  };
}

export interface OrganizationStructure {
  owner: Employee[];
  departments: Department[];
}

// Типы для досок
export interface Board {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    name: string;
  };
  columns?: BoardColumn[];
  tasks?: Task[];
}

export interface BoardColumn {
  id: number;
  boardId: number;
  name: string;
  status: TaskStatus;
  color: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TabType = 'news' | 'structure' | 'employees' | 'anniversaries' | 'events' | 'absences' | 'desktop' | 'dashboard' | 'statistics' | 'knowledge' | 'academy' | 'finances' | 'finplan' | 'control' | 'projects' | 'passwords' | 'profile' | 'admin' | 'companies' | 'departments' | 'boards' | 'tasks';

export interface FilterState {
  search: string;
  position: string;
  department: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface PasswordCategory {
  id: string;
  name: string;
  icon?: string;
  isPersonal?: boolean;
}

export interface Password {
  id: number;
  name: string;
  description?: string;
  url?: string;
  login: string;
  password: string;
  category: string;
  categoryId: string;
  sharedWith?: string[];
  isPersonal: boolean;
  updatedBy: string;
  updatedAt: string;
  activeUsers?: number;
  deletedCount?: number;
  hasWarning?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}






export interface KnowledgeArticle {
  id: number;
  title: string;
  content: any; // Rich text content в формате JSON или HTML
  category: string;
  folderId?: number;
  views: number;
  author: string;
  authorId: number;
  date: string;
  updatedAt: string;
  type: 'article';
  tags?: string[];
  icon?: string;
  coverImage?: string;
  quizzes?: Quiz[];
}

export interface KnowledgeFolder {
  id: number;
  title: string;
  description?: string;
  parentId?: number;
  type: 'folder';
  createdAt: string;
  createdBy: string;
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  correctAnswer?: number; // For single choice
  correctAnswers?: number[]; // For multiple choice
}

export interface Quiz {
  id: number;
  articleId: number;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: string;
  updatedAt: string;
  attempts?: QuizAttempt[];
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  employeeId: number;
  answers: any[];
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  author: string;
  authorId: number;
  participants: number[];
  views: number;
  lastUpdated: string;
  status: 'active' | 'draft';
  category: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string;
  order: number;
  duration?: number;
}

export interface Program {
  id: number;
  title: string;
  description: string;
  participants: number[];
  courseIds: number[];
  createdAt: string;
  createdBy: string;
}

// Финансовые типы
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'Доходы от услуг' | 'Операционные расходы' | 'Инвестиции' | 'Налоги' | 'Зарплаты' | 'Аренда' | 'Маркетинг' | 'Прочее';
export type Currency = 'KZT' | 'USD' | 'RUB' | 'EUR';

export interface Transaction {
  id: number;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  description: string;
  date: string;
  project?: string;
  counterparty?: string; // Контрагент
  account: string; // Счет
  createdBy: string;
  createdById: number;
  createdAt: string;
  tags?: string[];
}

export interface Account {
  id: number;
  name: string;
  currency: Currency;
  balance: number;
  type: 'bank' | 'cash' | 'card';
  description?: string;
}

export interface FinancialPeriod {
  start: string;
  end: string;
  label: string;
}

// Типы для задач
export type TaskStatus = 'new' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'backlog' | 'archive';
export type TaskPriority = 1 | 2 | 3; // 1 - низкий, 2 - средний, 3 - высокий

export interface Task {
  id: number;
  companyId: number;
  sprintId?: number;
  epicId?: number;
  title: string;
  description?: string;
  product?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  creatorId: number;
  dueDate?: string;
  tags: string[];
  category?: string;
  parentTaskId?: number;
  isFavorite: boolean;
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: number;
    name: string;
    avatar: string;
    department?: {
      id: number;
      name: string;
    };
  };
  creator?: {
    id: number;
    name: string;
    avatar: string;
  };
  company?: {
    id: number;
    name: string;
  };
  sprint?: Sprint;
  epic?: Epic;
  checklist?: ChecklistItem[];
  comments?: TaskComment[];
  timeLogs?: TimeLog[];
  blockedBy?: TaskDependency[];
  blocking?: TaskDependency[];
  watchers?: TaskWatcher[];
  subTasks?: Task[];
}

export interface Sprint {
  id: number;
  companyId: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Epic {
  id: number;
  companyId: number;
  title: string;
  description?: string;
  color?: string;
  status: 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface TaskComment {
  id: number;
  taskId: number;
  employeeId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: number;
  taskId: number;
  employeeId: number;
  hours: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: 'blocks' | 'relates_to';
  createdAt: string;
  task?: Task;
  dependsOn?: Task;
}

export interface TaskWatcher {
  id: number;
  taskId: number;
  employeeId: number;
  createdAt: string;
}

export interface TaskTemplate {
  id: number;
  companyId: number;
  title: string;
  description?: string;
  category?: string;
  defaultPriority: TaskPriority;
  defaultEstimatedHours?: number;
  defaultTags: string[];
  checklistTemplate?: string[];
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

