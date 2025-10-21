import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskColumn } from '../components/tasks/TaskColumn';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskSidebar } from '../components/tasks/TaskSidebar';
import { NotionTaskEditor } from '../components/tasks/NotionTaskEditor';
import { tasksApi } from '../services/api/tasks.api';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';

type ViewMode = 'board' | 'list' | 'calendar';

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
  const [activeFilter, setActiveFilter] = useState<'my' | 'all' | 'assignee'>('all');
  const [showSidebar, setShowSidebar] = useState(true);
  
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

  // Фильтрация задач
  const filteredTasks = tasks.filter((task) => {
    // Поиск по названию
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по исполнителю
    if (selectedAssignee && task.assigneeId !== selectedAssignee) {
      return false;
    }

    return true;
  });

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
        {/* Верхняя панель с заголовком и переключателями вида */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Кнопка переключения боковой панели */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showSidebar ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
              <p className="text-sm text-gray-500 mt-1">
                Всего задач: {tasks.length}
              </p>
            </div>
          </div>

          {/* Create Task Button */}
          <button
            onClick={handleCreateTask}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Создать задачу</span>
          </button>

          {/* Переключатель вида */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Фильтры быстрого доступа */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Мои задачи
          </button>
          <button
            onClick={() => setActiveFilter('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'my'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все задачи
          </button>
          <button
            onClick={() => setActiveFilter('assignee')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'assignee'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Делегированные задачи
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">1 фильтр</span>
        </div>
      </div>

      {/* Фильтры */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        employees={state.employees}
        activeFiltersCount={selectedAssignee ? 1 : 0}
      />

      {/* Канбан-доска */}
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

      {/* Список (TODO) */}
      {viewMode === 'list' && (
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <p className="p-8 text-center text-gray-500">
              Представление списком в разработке
            </p>
          </div>
        </div>
      )}

      {/* Календарь (TODO) */}
      {viewMode === 'calendar' && (
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <p className="p-8 text-center text-gray-500">
              Календарное представление в разработке
            </p>
          </div>
        </div>
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

