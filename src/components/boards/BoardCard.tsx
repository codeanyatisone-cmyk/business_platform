import React from 'react';
import { Star, Users, Archive, MoreHorizontal } from 'lucide-react';
import { Board } from '../../types';

interface BoardCardProps {
  board: Board;
  onBoardClick: (board: Board) => void;
  onToggleFavorite?: (boardId: number) => void;
  onArchive?: (boardId: number) => void;
}

export function BoardCard({ board, onBoardClick, onToggleFavorite, onArchive }: BoardCardProps) {
  const handleCardClick = () => {
    onBoardClick(board);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(board.id);
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive?.(board.id);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {/* Заголовок доски */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: board.color || '#3B82F6' }}
          />
          <h3 className="font-semibold text-gray-900 text-sm">{board.name}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleStarClick}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Star 
              className={`h-4 w-4 ${board.isDefault ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} 
            />
          </button>
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
            
            {/* Выпадающее меню */}
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleArchiveClick}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Archive className="h-4 w-4" />
                <span>{board.isArchived ? 'Восстановить' : 'Архивировать'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Описание */}
      {board.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {board.description}
        </p>
      )}

      {/* Информация о компании */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{board.company?.name || 'Компания'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {board.tasks && (
            <span>{board.tasks.length} задач</span>
          )}
          {board.isArchived && (
            <span className="text-orange-600">Архив</span>
          )}
        </div>
      </div>
    </div>
  );
}