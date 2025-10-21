import React from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
}

export function TaskColumn({ title, status, tasks, color, onTaskClick, onAddTask }: TaskColumnProps) {
  return (
    <div className="flex-shrink-0 w-80">
      {/* Заголовок колонки */}
      <div className={`${color} rounded-t-lg p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <span className="bg-white bg-opacity-30 text-white text-xs px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button className="text-white text-xs mt-2 hover:underline">
          + новая задача
        </button>
      </div>

      {/* Список задач */}
      <div className="bg-gray-50 p-3 space-y-3 min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)] overflow-y-auto rounded-b-lg">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </div>
    </div>
  );
}


