import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CreateBoardCardProps {
  onCreateBoard: (name: string, description?: string, color?: string) => void;
}

export function CreateBoardCard({ onCreateBoard }: CreateBoardCardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateBoard(name.trim(), description.trim() || undefined, color);
      setName('');
      setDescription('');
      setColor('#3B82F6');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setColor('#3B82F6');
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <div 
        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsCreating(true)}
      >
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Plus className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Создать доску</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        {/* Название */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Название доски"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            autoFocus
          />
        </div>

        {/* Описание */}
        <div className="mb-3">
          <textarea
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        {/* Цвета */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Цвет доски
          </label>
          <div className="flex space-x-2">
            {colors.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-6 h-6 rounded-full border-2 ${
                  color === colorOption ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 bg-pink-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Создать
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}