const express = require('express');
const router = express.Router();

// Mock data для тестирования
const mockBoards = [
  {
    id: 1,
    name: 'Основная доска',
    description: 'Главная доска для управления проектами',
    color: '#3B82F6',
    isDefault: true,
    isArchived: false,
    company: { id: 1, name: 'Компания 1' },
    tasks: []
  },
  {
    id: 2,
    name: 'Разработка',
    description: 'Доска для задач разработки',
    color: '#10B981',
    isDefault: false,
    isArchived: false,
    company: { id: 1, name: 'Компания 1' },
    tasks: []
  }
];

const mockCompanies = [
  { id: 1, name: 'Компания 1', description: 'Основная компания' },
  { id: 2, name: 'Компания 2', description: 'Дочерняя компания' }
];

const mockEmployees = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', position: 'Разработчик' },
  { id: 2, name: 'Петр Петров', email: 'petr@example.com', position: 'Дизайнер' }
];

const mockTasks = [
  {
    id: 1,
    title: 'Создать API для досок',
    description: 'Разработать REST API для управления досками',
    status: 'in_progress',
    priority: 'high',
    assignee: mockEmployees[0],
    boardId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Настроить Axios',
    description: 'Настроить HTTP клиент для работы с API',
    status: 'todo',
    priority: 'medium',
    assignee: mockEmployees[1],
    boardId: 1,
    createdAt: new Date().toISOString()
  }
];

// Boards API
router.get('/boards', (req, res) => {
  const { companyId } = req.query;
  let boards = mockBoards;
  
  if (companyId) {
    boards = boards.filter(board => board.company.id === parseInt(companyId));
  }
  
  res.json(boards);
});

router.get('/boards/:id', (req, res) => {
  const board = mockBoards.find(b => b.id === parseInt(req.params.id));
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  res.json(board);
});

router.post('/boards', (req, res) => {
  const { name, description, color, companyId } = req.body;
  
  if (!name || !companyId) {
    return res.status(400).json({ error: 'Name and companyId are required' });
  }
  
  const newBoard = {
    id: mockBoards.length + 1,
    name,
    description: description || '',
    color: color || '#3B82F6',
    isDefault: false,
    isArchived: false,
    company: mockCompanies.find(c => c.id === companyId),
    tasks: []
  };
  
  mockBoards.push(newBoard);
  res.status(201).json(newBoard);
});

router.put('/boards/:id', (req, res) => {
  const boardIndex = mockBoards.findIndex(b => b.id === parseInt(req.params.id));
  if (boardIndex === -1) {
    return res.status(404).json({ error: 'Board not found' });
  }
  
  mockBoards[boardIndex] = { ...mockBoards[boardIndex], ...req.body };
  res.json(mockBoards[boardIndex]);
});

// Companies API
router.get('/companies', (req, res) => {
  res.json(mockCompanies);
});

router.get('/companies/:id', (req, res) => {
  const company = mockCompanies.find(c => c.id === parseInt(req.params.id));
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json(company);
});

// Employees API
router.get('/employees', (req, res) => {
  res.json(mockEmployees);
});

router.get('/employees/:id', (req, res) => {
  const employee = mockEmployees.find(e => e.id === parseInt(req.params.id));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  res.json(employee);
});

// Tasks API
router.get('/tasks', (req, res) => {
  const { boardId } = req.query;
  let tasks = mockTasks;
  
  if (boardId) {
    tasks = tasks.filter(task => task.boardId === parseInt(boardId));
  }
  
  res.json(tasks);
});

router.get('/tasks/:id', (req, res) => {
  const task = mockTasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

router.post('/tasks', (req, res) => {
  const { title, description, status, priority, assigneeId, boardId } = req.body;
  
  if (!title || !boardId) {
    return res.status(400).json({ error: 'Title and boardId are required' });
  }
  
  const assignee = mockEmployees.find(e => e.id === assigneeId);
  
  const newTask = {
    id: mockTasks.length + 1,
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    assignee,
    boardId: parseInt(boardId),
    createdAt: new Date().toISOString()
  };
  
  mockTasks.push(newTask);
  res.status(201).json(newTask);
});

// Auth API (базовая реализация)
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Простая проверка для демонстрации
  if (email === 'admin@example.com' && password === 'admin') {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      token,
      user: {
        id: 1,
        email: 'admin@example.com',
        name: 'Администратор'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

