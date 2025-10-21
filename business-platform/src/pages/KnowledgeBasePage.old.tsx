import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Folder, Plus, Edit2, Trash2, FileText, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { KnowledgeArticle, KnowledgeFolder } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function KnowledgeBasePage() {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Modal states
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [editingFolder, setEditingFolder] = useState<KnowledgeFolder | null>(null);
  
  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });
  
  const [folderForm, setFolderForm] = useState({
    title: '',
    description: '',
    parentId: null as number | null,
  });

  // Toggle folder expansion
  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    return state.knowledgeArticles.filter(article => {
      const matchesSearch = !searchQuery || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFolder = selectedFolderId === null || article.folderId === selectedFolderId;
      
      return matchesSearch && matchesFolder;
    });
  }, [state.knowledgeArticles, searchQuery, selectedFolderId]);

  // Get articles for current folder
  const currentFolderArticles = useMemo(() => {
    return state.knowledgeArticles.filter(a => a.folderId === selectedFolderId);
  }, [state.knowledgeArticles, selectedFolderId]);

  // Get selected article
  const selectedArticle = useMemo(() => {
    return state.knowledgeArticles.find(a => a.id === selectedArticleId);
  }, [state.knowledgeArticles, selectedArticleId]);

  // Get selected folder
  const selectedFolder = useMemo(() => {
    return state.knowledgeFolders.find(f => f.id === selectedFolderId);
  }, [state.knowledgeFolders, selectedFolderId]);

  // Handle create/update article
  const handleSaveArticle = () => {
    if (!articleForm.title.trim()) {
      showNotification({ message: 'Введите название статьи', type: 'error' });
      return;
    }
    
    if (!articleForm.content.trim()) {
      showNotification({ message: 'Введите содержимое статьи', type: 'error' });
      return;
    }

    const currentUser = state.employees[0]; // For demo
    
    if (editingArticle) {
      const updated: KnowledgeArticle = {
        ...editingArticle,
        title: articleForm.title,
        content: articleForm.content,
        category: articleForm.category,
        tags: articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()) : [],
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_KNOWLEDGE_ARTICLE', payload: updated });
      showNotification({ message: 'Статья обновлена', type: 'success' });
    } else {
      const newArticle: KnowledgeArticle = {
        id: Date.now(),
        title: articleForm.title,
        content: articleForm.content,
        category: articleForm.category || 'Общие',
        folderId: selectedFolderId || undefined,
        views: 0,
        author: currentUser?.name || 'Текущий пользователь',
        authorId: currentUser?.id || 1,
        date: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'article',
        tags: articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()) : [],
      };
      dispatch({ type: 'ADD_KNOWLEDGE_ARTICLE', payload: newArticle });
      showNotification({ message: 'Статья создана', type: 'success' });
    }
    
    setShowArticleModal(false);
    setEditingArticle(null);
    setArticleForm({ title: '', content: '', category: '', tags: '' });
  };

  // Handle create/update folder
  const handleSaveFolder = () => {
    if (!folderForm.title.trim()) {
      showNotification({ message: 'Введите название папки', type: 'error' });
      return;
    }

    const currentUser = state.employees[0];
    
    if (editingFolder) {
      const updated: KnowledgeFolder = {
        ...editingFolder,
        title: folderForm.title,
        description: folderForm.description,
      };
      dispatch({ type: 'UPDATE_KNOWLEDGE_FOLDER', payload: updated });
      showNotification({ message: 'Папка обновлена', type: 'success' });
    } else {
      const newFolder: KnowledgeFolder = {
        id: Date.now(),
        title: folderForm.title,
        description: folderForm.description,
        parentId: folderForm.parentId || undefined,
        type: 'folder',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Текущий пользователь',
      };
      dispatch({ type: 'ADD_KNOWLEDGE_FOLDER', payload: newFolder });
      showNotification({ message: 'Папка создана', type: 'success' });
    }
    
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderForm({ title: '', description: '', parentId: null });
  };

  // Handle delete article
  const handleDeleteArticle = (articleId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      dispatch({ type: 'DELETE_KNOWLEDGE_ARTICLE', payload: articleId });
      showNotification({ message: 'Статья удалена', type: 'success' });
      if (selectedArticleId === articleId) {
        setSelectedArticleId(null);
      }
    }
  };

  // Handle delete folder
  const handleDeleteFolder = (folderId: number) => {
    const articlesInFolder = state.knowledgeArticles.filter(a => a.folderId === folderId);
    if (articlesInFolder.length > 0) {
      if (!window.confirm(`В папке ${articlesInFolder.length} статей. Удалить папку и все статьи?`)) {
        return;
      }
    } else {
      if (!window.confirm('Вы уверены, что хотите удалить эту папку?')) {
        return;
      }
    }
    
    dispatch({ type: 'DELETE_KNOWLEDGE_FOLDER', payload: folderId });
    showNotification({ message: 'Папка удалена', type: 'success' });
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  // Handle view article
  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticleId(article.id);
    dispatch({ type: 'INCREMENT_ARTICLE_VIEWS', payload: article.id });
  };

  // Handle edit article
  const handleEditArticle = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags?.join(', ') || '',
    });
    setShowArticleModal(true);
  };

  // Handle edit folder
  const handleEditFolder = (folder: KnowledgeFolder) => {
    setEditingFolder(folder);
    setFolderForm({
      title: folder.title,
      description: folder.description || '',
      parentId: folder.parentId || null,
    });
    setShowFolderModal(true);
  };

  // Render sidebar item (folder/article)
  const renderSidebarItem = (folder: KnowledgeFolder, level = 0) => {
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const paddingLeft = level * 16 + 16;
    const articlesInFolder = state.knowledgeArticles.filter(a => a.folderId === folder.id);

    return (
      <div key={folder.id}>
        <div 
          className={`flex items-center py-2 px-4 hover:bg-gray-50 cursor-pointer group ${
            isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center flex-1" onClick={() => {
            toggleFolder(folder.id);
            setSelectedFolderId(folder.id);
            setSelectedArticleId(null);
          }}>
            <ChevronRight 
              className={`h-4 w-4 mr-2 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
            <Folder className="h-4 w-4 mr-2" />
            <span className="text-sm flex-1">{folder.title}</span>
            <span className="text-xs text-gray-400 ml-2">{articlesInFolder.length}</span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditFolder(folder);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Редактировать"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Удалить"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get main content
  const getCurrentContent = () => {
    // If article is selected, show article view
    if (selectedArticle) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setSelectedArticleId(null)}
              className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
              Назад к списку
            </button>
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h1>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>{selectedArticle.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.date).toLocaleDateString('ru-RU')}</span>
                  <span>•</span>
                  <span>{selectedArticle.views} просмотров</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditArticle(selectedArticle)}
                  icon={<Edit2 className="h-4 w-4" />}
                >
                  Редактировать
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteArticle(selectedArticle.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Удалить
                </Button>
              </div>
            </div>
            
            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedArticle.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="prose prose-blue max-w-none">
              <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
          </div>
        </div>
      );
    }

    // If folder is selected, show folder contents
    if (selectedFolder) {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-gray-400 mr-4" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{selectedFolder.title}</h1>
                {selectedFolder.description && (
                  <p className="text-gray-500 mt-1">{selectedFolder.description}</p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowArticleModal(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Добавить статью
            </Button>
          </div>

          <div className="space-y-3">
            {currentFolderArticles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">В этой папке пока нет статей</p>
                <Button
                  size="sm"
                  onClick={() => setShowArticleModal(true)}
                  className="mt-4"
                >
                  Создать первую статью
                </Button>
              </div>
            ) : (
              currentFolderArticles.map(article => (
                <div 
                  key={article.id} 
                  className="flex items-center py-3 px-4 hover:bg-gray-50 rounded-lg group cursor-pointer"
                  onClick={() => handleViewArticle(article)}
                >
                  <FileText className="h-4 w-4 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {article.author} • {new Date(article.date).toLocaleDateString('ru-RU')}
                      • {article.views} просмотров
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditArticle(article);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Редактировать"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(article.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Default: show all articles grouped by folder or search results
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'База знаний'}
          </h1>
          <Button
            size="sm"
            onClick={() => setShowArticleModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Добавить статью
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего статей</h3>
            <div className="text-3xl font-bold text-gray-900">{state.knowledgeArticles.length}</div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего просмотров</h3>
            <div className="text-3xl font-bold text-orange-500">
              {state.knowledgeArticles.reduce((acc, a) => acc + a.views, 0)}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Папок</h3>
            <div className="text-3xl font-bold text-blue-500">{state.knowledgeFolders.length}</div>
          </div>
        </div>

        {/* Articles list */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'Ничего не найдено' : 'Статьи еще не созданы'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => setShowArticleModal(true)}
                className="mt-4"
              >
                Создать первую статью
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map(article => (
              <div 
                key={article.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleViewArticle(article)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {article.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{new Date(article.date).toLocaleDateString('ru-RU')}</span>
                      <span>•</span>
                      <span>{article.views} просмотров</span>
                      {article.category && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{article.category}</span>
                        </>
                      )}
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditArticle(article);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Редактировать"
                    >
                      <Edit2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArticle(article.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex relative">
      {/* Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static w-64 sm:w-80 bg-white border-r border-gray-200 flex flex-col h-screen top-0 z-50 lg:z-0 transform transition-transform lg:transform-none ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Искать по базе знаний"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setSelectedArticleId(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedFolderId === null && !selectedArticleId
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Все статьи
            </button>
          </div>
          {state.knowledgeFolders.map(folder => renderSidebarItem(folder))}
        </div>

        {/* Add Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowArticleModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить статью
          </button>
          <button
            onClick={() => setShowFolderModal(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать папку
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-8 overflow-y-auto">
        {/* Mobile menu button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden mb-4 p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {getCurrentContent()}
      </div>

      {/* Article Modal */}
      {showArticleModal && (
        <Modal
          isOpen={showArticleModal}
          onClose={() => {
            setShowArticleModal(false);
            setEditingArticle(null);
            setArticleForm({ title: '', content: '', category: '', tags: '' });
          }}
          title={editingArticle ? 'Редактировать статью' : 'Создать статью'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название статьи *
              </label>
              <Input
                placeholder="Введите название"
                value={articleForm.title}
                onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <Input
                placeholder="Например: HR, Продажи, Разработка"
                value={articleForm.category}
                onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Содержимое статьи *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={10}
                placeholder="Введите текст статьи..."
                value={articleForm.content}
                onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Теги (через запятую)
              </label>
              <Input
                placeholder="инструкция, важное, новичкам"
                value={articleForm.tags}
                onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowArticleModal(false);
                  setEditingArticle(null);
                  setArticleForm({ title: '', content: '', category: '', tags: '' });
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveArticle}>
                {editingArticle ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <Modal
          isOpen={showFolderModal}
          onClose={() => {
            setShowFolderModal(false);
            setEditingFolder(null);
            setFolderForm({ title: '', description: '', parentId: null });
          }}
          title={editingFolder ? 'Редактировать папку' : 'Создать папку'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название папки *
              </label>
              <Input
                placeholder="Введите название"
                value={folderForm.title}
                onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание (опционально)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Краткое описание папки..."
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFolderModal(false);
                  setEditingFolder(null);
                  setFolderForm({ title: '', description: '', parentId: null });
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveFolder}>
                {editingFolder ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
