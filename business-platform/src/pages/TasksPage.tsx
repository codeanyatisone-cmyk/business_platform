import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, 
  List, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Star,
  Clock,
  User,
  Tag,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskColumn } from '../components/tasks/TaskColumn';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskSidebar } from '../components/tasks/TaskSidebar';
import { NotionTaskEditor } from '../components/tasks/NotionTaskEditor';
import { NotionTaskList } from '../components/tasks/NotionTaskList';
import { NotionTaskCalendar } from '../components/tasks/NotionTaskCalendar';
import { tasksApi } from '../services/api/tasks.api';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

type ViewMode = 'board' | 'list' | 'calendar';
type FilterType = 'all' | 'my' | 'assigned' | 'favorites' | 'overdue' | 'completed';

export function TasksPage() {
  const { state } = useApp();
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<number | undefined>();
  const [selectedSprint, setSelectedSprint] = useState<number | undefined>();
  const [selectedEpic, setSelectedEpic] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<number | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created' | 'due' | 'priority' | 'title'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Notion editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Колонки канбан-доски
  const columns: Array<{ title: string; status: TaskStatus; color: string }> = [
    { title: 'Бэклог', status: 'backlog', color: 'bg-gray-400' },
    { title: 'Новые', status: 'new', color: 'bg-green-500' },
    { title: 'В работе', status: 'in_progress', color: 'bg-blue-500' },
    { title: 'Ждут проверки', status: 'review', color: 'bg-yellow-500' },
    { title: 'Решено', status: 'completed', color: 'bg-gray-600' },
    { title: 'Отмененные', status: 'cancelled', color: 'bg-gray-400' },
    { title: 'Готово', status: 'completed', color: 'bg-green-600' },
    { title: 'Архив', status: 'archive', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    loadTasks();
  }, [state.currentCompanyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getTasks(state.currentCompanyId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering and sorting
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Assignee filter
    if (selectedAssignee) {
      filtered = filtered.filter(task => task.assigneeId === selectedAssignee);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(task => 
        selectedTags.every(tag => task.tags.includes(tag))
      );
    }

    // Quick filters
    switch (activeFilter) {
      case 'my':
        filtered = filtered.filter(task => task.assigneeId === 1); // TODO: Get current user ID
        break;
      case 'assigned':
        filtered = filtered.filter(task => task.assigneeId && task.assigneeId !== 1);
        break;
      case 'favorites':
        filtered = filtered.filter(task => task.isFavorite);
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'completed');
        break;
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'due':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          comparison = b.priority - a.priority;
          break;
        case 'created':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedAssignee, selectedTags, activeFilter, sortBy, sortOrder]);

  // Группировка задач по статусам
  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsEditorOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = { ...editingTask, ...taskData };
        await tasksApi.updateTask(editingTask.id, updatedTask);
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
        showNotification({
          message: 'Задача успешно обновлена',
          type: 'success'
        });
      } else {
        // Create new task
        const newTask = await tasksApi.createTask({
          ...taskData,
          companyId: state.currentCompanyId,
          creatorId: 1, // TODO: Get from auth context
          createdAt: new Date().toISOString(),
          isFavorite: false
        } as Task);
        setTasks([...tasks, newTask]);
        showNotification({
          message: 'Задача успешно создана',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      showNotification({
        message: 'Ошибка при сохранении задачи',
        type: 'error'
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksApi.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      showNotification({
        message: 'Задача успешно удалена',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      showNotification({
        message: 'Ошибка при удалении задачи',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Боковая панель фильтров */}
      {showSidebar && (
        <TaskSidebar
          employees={state.employees}
          selectedEmployee={selectedAssignee}
          selectedSprint={selectedSprint}
          selectedEpic={selectedEpic}
          onEmployeeSelect={setSelectedAssignee}
          onSprintSelect={setSelectedSprint}
          onEpicSelect={setSelectedEpic}
        />
      )}

      {/* Основная область */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Toggle Sidebar */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredTasks.length} из {tasks.length} задач
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Create Task Button */}
              <Button
                onClick={handleCreateTask}
                className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600"
              >
                <Plus className="h-4 w-4" />
                <span>Создать задачу</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'board'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Канбан доска"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Список"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Календарь"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setActiveFilter('my')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'my'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Мои
              </button>
              <button
                onClick={() => setActiveFilter('favorites')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'favorites'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveFilter('overdue')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'overdue'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-32"
                options={[
                  { value: 'created', label: 'По дате' },
                  { value: 'due', label: 'По сроку' },
                  { value: 'priority', label: 'По приоритету' },
                  { value: 'title', label: 'По названию' }
                ]}
              />
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'По убыванию' : 'По возрастанию'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    options={[
                      { value: 'all', label: 'Все статусы' },
                      { value: 'new', label: 'Новые' },
                      { value: 'in_progress', label: 'В работе' },
                      { value: 'review', label: 'На проверке' },
                      { value: 'completed', label: 'Завершены' },
                      { value: 'cancelled', label: 'Отменены' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
                  <Select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    options={[
                      { value: 'all', label: 'Все приоритеты' },
                      { value: '3', label: 'Высокий' },
                      { value: '2', label: 'Средний' },
                      { value: '1', label: 'Низкий' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Исполнитель</label>
                  <Select
                    value={selectedAssignee || ''}
                    onChange={(e) => setSelectedAssignee(e.target.value ? Number(e.target.value) : undefined)}
                    options={[
                      { value: '', label: 'Все исполнители' },
                      ...state.employees.map(emp => ({
                        value: emp.id.toString(),
                        label: emp.name
                      }))
                    ]}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                      setSelectedAssignee(undefined);
                      setSelectedTags([]);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Views */}
        {viewMode === 'board' && (
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex space-x-4 min-w-max">
              {columns.map((column) => (
                <TaskColumn
                  key={column.status}
                  title={column.title}
                  status={column.status}
                  tasks={getTasksByStatus(column.status)}
                  color={column.color}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <NotionTaskList
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleSaveTask}
            onTaskDelete={handleDeleteTask}
            employees={state.employees}
          />
        )}

        {viewMode === 'calendar' && (
          <NotionTaskCalendar
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleSaveTask}
            onTaskDelete={handleDeleteTask}
            employees={state.employees}
          />
        )}
      </div>
      
      {/* Notion Task Editor */}
      <NotionTaskEditor
        task={editingTask}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}

