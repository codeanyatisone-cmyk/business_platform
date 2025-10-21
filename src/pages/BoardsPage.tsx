import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Archive, Users } from 'lucide-react';
import { Board, Company } from '../../types';
import { BoardCard } from '../../components/boards/BoardCard';
import { CreateBoardCard } from '../../components/boards/CreateBoardCard';
import { boardsApi } from '../../services/api/boards.api';
import { useApp } from '../../contexts/AppContext';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'favorites' | 'archived';

export function BoardsPage() {
  const { state } = useApp();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<number | undefined>();

  useEffect(() => {
    loadBoards();
  }, [state.currentCompanyId, selectedCompany]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const companyId = selectedCompany || state.currentCompanyId;
      const data = await boardsApi.getBoards(companyId);
      setBoards(data);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (name: string, description?: string, color?: string) => {
    try {
      const companyId = selectedCompany || state.currentCompanyId;
      const newBoard = await boardsApi.createBoard({
        companyId,
        name,
        description,
        color,
        isDefault: false,
        isArchived: false,
      });
      setBoards(prev => [newBoard, ...prev]);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleBoardClick = (board: Board) => {
    // Переходим к задачам этой доски
    // TODO: Реализовать переход к задачам конкретной доски
    console.log('Opening board:', board);
  };

  const handleToggleFavorite = async (boardId: number) => {
    try {
      const board = boards.find(b => b.id === boardId);
      if (board) {
        const updatedBoard = await boardsApi.updateBoard(boardId, {
          isDefault: !board.isDefault
        });
        setBoards(prev => 
          prev.map(b => b.id === boardId ? updatedBoard : b)
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleArchive = async (boardId: number) => {
    try {
      const board = boards.find(b => b.id === boardId);
      if (board) {
        const updatedBoard = await boardsApi.updateBoard(boardId, {
          isArchived: !board.isArchived
        });
        setBoards(prev => 
          prev.map(b => b.id === boardId ? updatedBoard : b)
        );
      }
    } catch (error) {
      console.error('Failed to archive board:', error);
    }
  };

  // Фильтрация досок
  const filteredBoards = boards.filter(board => {
    // Поиск по названию
    if (searchQuery && !board.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по типу
    switch (filter) {
      case 'favorites':
        return board.isDefault;
      case 'archived':
        return board.isArchived;
      default:
        return !board.isArchived;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Заголовок и фильтры */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Доски</h1>
            <p className="text-sm text-gray-500 mt-1">
              Управление досками компаний
            </p>
          </div>

          {/* Переключатель вида */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="h-5 w-5 inline-block mr-1" /> Сетка
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-5 w-5 inline-block mr-1" /> Список
            </button>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex items-center space-x-4">
          {/* Поиск */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск досок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Фильтры */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все доски
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'favorites'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Star className="h-4 w-4 inline-block mr-1" />
              Избранные
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'archived'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Archive className="h-4 w-4 inline-block mr-1" />
              Архив
            </button>
          </div>
        </div>
      </div>

      {/* Список досок */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CreateBoardCard onCreateBoard={handleCreateBoard} />
            {filteredBoards.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onBoardClick={handleBoardClick}
                onToggleFavorite={handleToggleFavorite}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBoards.map(board => (
              <div key={board.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: board.color || '#3B82F6' }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{board.name}</h3>
                      {board.description && (
                        <p className="text-sm text-gray-600">{board.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{board.company?.name}</span>
                    </div>
                    {board.tasks && (
                      <span>{board.tasks.length} задач</span>
                    )}
                    {board.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {board.isArchived && (
                      <span className="text-orange-600">Архив</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBoards.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Grid className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Доски не найдены' : 'Нет досок'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Попробуйте изменить поисковый запрос'
                : 'Создайте первую доску для начала работы'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}