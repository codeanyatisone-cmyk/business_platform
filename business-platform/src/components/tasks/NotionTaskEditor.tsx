import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MessageSquare, 
  CheckSquare,
  Square,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  Save,
  Trash2
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../contexts/AppContext';
import { useNotification } from '../../hooks/useNotification';

interface NotionTaskEditorProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete?: (taskId: number) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

export function NotionTaskEditor({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: NotionTaskEditorProps) {
  const { state } = useApp();
  const { showNotification } = useNotification();
  
  // State for task data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('new');
  const [priority, setPriority] = useState<TaskPriority>(1);
  const [assigneeId, setAssigneeId] = useState<number | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>();
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  
  // Rich content state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // UI state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Initialize form data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate || '');
      setTags(task.tags || []);
      setStoryPoints(task.storyPoints);
      setEstimatedHours(task.estimatedHours);
      
      // Initialize checklist from task data
      if (task.checklist) {
        setChecklist(task.checklist.map((item, index) => ({
          id: `item-${index}`,
          text: typeof item === 'string' ? item : item.text,
          completed: typeof item === 'object' ? item.completed : false
        })));
      }
    } else {
      // Reset for new task
      setTitle('');
      setDescription('');
      setStatus('new');
      setPriority(1);
      setAssigneeId(undefined);
      setDueDate('');
      setTags([]);
      setStoryPoints(undefined);
      setEstimatedHours(undefined);
      setChecklist([]);
      setIsEditingTitle(true);
    }
  }, [task, isOpen]);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSave = () => {
    if (!title.trim()) {
      showNotification({
        message: 'Заголовок задачи не может быть пустым',
        type: 'error'
      });
      return;
    }

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId,
      dueDate: dueDate || undefined,
      tags,
      storyPoints,
      estimatedHours,
      checklist: checklist
    };

    onSave(taskData);
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: '',
      completed: false
    };
    setChecklist([...checklist, newItem]);
  };

  const updateChecklistItem = (id: string, text: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        author: 'Текущий пользователь',
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        avatar: '/api/placeholder/32/32'
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex h-full">
        {/* Main Content */}
        <div className="flex-1 bg-white overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProperties(!showProperties)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showProperties ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {task ? `Задача #${task.id}` : 'Новая задача'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Сохранить</span>
                </Button>
                {task && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex h-full">
            {/* Main Editor */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {/* Title */}
                <div className="mb-6">
                  {isEditingTitle ? (
                    <input
                      ref={titleRef}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingTitle(false);
                        }
                      }}
                      placeholder="Название задачи..."
                      className="w-full text-2xl font-semibold text-gray-900 border-none outline-none bg-transparent resize-none"
                    />
                  ) : (
                    <h1
                      onClick={() => setIsEditingTitle(true)}
                      className="text-2xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
                    >
                      {title || 'Название задачи...'}
                    </h1>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <textarea
                    ref={descriptionRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Добавьте описание задачи..."
                    className="w-full min-h-[120px] text-gray-700 border-none outline-none bg-transparent resize-none"
                  />
                </div>

                {/* Checklist */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckSquare className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Чеклист</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 group">
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {item.completed ? (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                          placeholder="Элемент чеклиста..."
                          className={`flex-1 text-gray-700 border-none outline-none bg-transparent ${
                            item.completed ? 'line-through text-gray-500' : ''
                          }`}
                        />
                        <button
                          onClick={() => removeChecklistItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={addChecklistItem}
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить элемент</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Комментарии</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            <span className="text-sm text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Добавить комментарий..."
                          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                          rows={3}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={addComment}
                            disabled={!newComment.trim()}
                          >
                            Комментировать
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            {showProperties && (
              <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Свойства</h3>
                  
                  <div className="space-y-6">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Статус
                      </label>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        className="w-full"
                        options={[
                          { value: 'new', label: 'Новая' },
                          { value: 'in_progress', label: 'В работе' },
                          { value: 'review', label: 'На проверке' },
                          { value: 'completed', label: 'Завершена' },
                          { value: 'cancelled', label: 'Отменена' },
                          { value: 'backlog', label: 'Бэклог' },
                          { value: 'archive', label: 'Архив' }
                        ]}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Приоритет
                      </label>
                      <Select
                        value={priority.toString()}
                        onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        className="w-full"
                        options={[
                          { value: '1', label: 'Низкий' },
                          { value: '2', label: 'Средний' },
                          { value: '3', label: 'Высокий' }
                        ]}
                      />
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Исполнитель
                      </label>
                      <Select
                        value={assigneeId?.toString() || ''}
                        onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full"
                        options={[
                          { value: '', label: 'Не назначен' },
                          ...state.employees.map((employee) => ({
                            value: employee.id.toString(),
                            label: employee.name
                          }))
                        ]}
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Срок выполнения
                      </label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Story Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Points
                      </label>
                      <Input
                        type="number"
                        value={storyPoints || ''}
                        onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="w-full"
                      />
                    </div>

                    {/* Estimated Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Оценка времени (часы)
                      </label>
                      <Input
                        type="number"
                        value={estimatedHours || ''}
                        onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="w-full"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Теги
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Добавить тег..."
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addTag();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={addTag}
                            disabled={!newTag.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
