import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  Folder,
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  Save,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { KnowledgeArticle, KnowledgeFolder, Quiz } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { QuizEditor, QuizQuestion } from '../components/ui/QuizEditor';
import { QuizTaker } from '../components/ui/QuizTaker';

type ViewMode = 'list' | 'article' | 'editor' | 'quiz-editor' | 'quiz-taker';

export function KnowledgeBasePage() {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<KnowledgeFolder | null>(null);

  // Editor states
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleCategory, setArticleCategory] = useState('');
  const [articleTags, setArticleTags] = useState('');

  // Quiz states
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  // Folder form
  const [folderForm, setFolderForm] = useState({
    title: '',
    description: '',
    parentId: null as number | null,
  });

  // Toggle folder expansion
  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  // Filter articles by search
  const filteredArticles = useMemo(() => {
    return state.knowledgeArticles.filter((article) => {
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof article.content === 'string' &&
          article.content.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFolder = selectedFolderId === null || article.folderId === selectedFolderId;

      return matchesSearch && matchesFolder;
    });
  }, [state.knowledgeArticles, searchQuery, selectedFolderId]);

  // Get selected article
  const selectedArticle = useMemo(() => {
    return state.knowledgeArticles.find((a) => a.id === selectedArticleId);
  }, [state.knowledgeArticles, selectedArticleId]);

  // Get selected folder
  const selectedFolder = useMemo(() => {
    return state.knowledgeFolders.find((f) => f.id === selectedFolderId);
  }, [state.knowledgeFolders, selectedFolderId]);

  // ============ FOLDER HANDLERS ============

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

  const handleDeleteFolder = (folderId: number) => {
    const articlesInFolder = state.knowledgeArticles.filter((a) => a.folderId === folderId);
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

  const handleEditFolder = (folder: KnowledgeFolder) => {
    setEditingFolder(folder);
    setFolderForm({
      title: folder.title,
      description: folder.description || '',
      parentId: folder.parentId || null,
    });
    setShowFolderModal(true);
  };

  // ============ ARTICLE HANDLERS ============

  const handleViewArticle = (article: KnowledgeArticle) => {
    setSelectedArticleId(article.id);
    dispatch({ type: 'INCREMENT_ARTICLE_VIEWS', payload: article.id });
    setViewMode('article');
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleContent('');
    setArticleCategory('');
    setArticleTags('');
    setViewMode('editor');
  };

  const handleEditArticle = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setArticleTitle(article.title);
    setArticleContent(typeof article.content === 'string' ? article.content : '');
    setArticleCategory(article.category);
    setArticleTags(article.tags?.join(', ') || '');
    setViewMode('editor');
  };

  const handleSaveArticle = () => {
    if (!articleTitle.trim()) {
      showNotification({ message: 'Введите название статьи', type: 'error' });
      return;
    }

    if (!articleContent.trim()) {
      showNotification({ message: 'Введите содержимое статьи', type: 'error' });
      return;
    }

    const currentUser = state.employees[0];

    if (editingArticle) {
      const updated: KnowledgeArticle = {
        ...editingArticle,
        title: articleTitle,
        content: articleContent,
        category: articleCategory || 'Общие',
        tags: articleTags ? articleTags.split(',').map((t) => t.trim()) : [],
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_KNOWLEDGE_ARTICLE', payload: updated });
      showNotification({ message: 'Статья обновлена', type: 'success' });
      setSelectedArticleId(updated.id);
      setViewMode('article');
    } else {
      const newArticle: KnowledgeArticle = {
        id: Date.now(),
        title: articleTitle,
        content: articleContent,
        category: articleCategory || 'Общие',
        folderId: selectedFolderId || undefined,
        views: 0,
        author: currentUser?.name || 'Текущий пользователь',
        authorId: currentUser?.id || 1,
        date: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'article',
        tags: articleTags ? articleTags.split(',').map((t) => t.trim()) : [],
      };
      dispatch({ type: 'ADD_KNOWLEDGE_ARTICLE', payload: newArticle });
      showNotification({ message: 'Статья создана', type: 'success' });
      setSelectedArticleId(newArticle.id);
      setViewMode('article');
    }
  };

  const handleDeleteArticle = (articleId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      dispatch({ type: 'DELETE_KNOWLEDGE_ARTICLE', payload: articleId });
      showNotification({ message: 'Статья удалена', type: 'success' });
      if (selectedArticleId === articleId) {
        setSelectedArticleId(null);
        setViewMode('list');
      }
    }
  };

  // ============ QUIZ HANDLERS ============

  const handleNewQuiz = () => {
    if (!selectedArticle) {
      showNotification({ message: 'Выберите статью', type: 'error' });
      return;
    }
    setEditingQuiz(null);
    setQuizTitle('');
    setQuizQuestions([]);
    setQuizPassingScore(70);
    setViewMode('quiz-editor');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title);
    setQuizQuestions(quiz.questions);
    setQuizPassingScore(quiz.passingScore);
    setViewMode('quiz-editor');
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim()) {
      showNotification({ message: 'Введите название теста', type: 'error' });
      return;
    }

    if (quizQuestions.length === 0) {
      showNotification({ message: 'Добавьте хотя бы один вопрос', type: 'error' });
      return;
    }

    // Validate questions
    for (const q of quizQuestions) {
      if (!q.question.trim()) {
        showNotification({ message: 'Заполните все вопросы', type: 'error' });
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        showNotification({ message: 'Заполните все варианты ответов', type: 'error' });
        return;
      }
    }

    if (editingQuiz) {
      const updated: Quiz = {
        ...editingQuiz,
        title: quizTitle,
        questions: quizQuestions,
        passingScore: quizPassingScore,
        updatedAt: new Date().toISOString(),
      };
      // dispatch({ type: 'UPDATE_QUIZ', payload: updated });
      showNotification({ message: 'Тест обновлен', type: 'success' });
    } else {
      const newQuiz: Quiz = {
        id: Date.now(),
        articleId: selectedArticle!.id,
        title: quizTitle,
        questions: quizQuestions,
        passingScore: quizPassingScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // dispatch({ type: 'ADD_QUIZ', payload: newQuiz });
      showNotification({ message: 'Тест создан', type: 'success' });
    }

    setViewMode('article');
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setTakingQuiz(quiz);
    setViewMode('quiz-taker');
  };

  const handleSubmitQuiz = (answers: any[]) => {
    showNotification({ message: 'Тест отправлен на проверку', type: 'success' });
  };

  // ============ RENDER HELPERS ============

  const renderSidebarItem = (folder: KnowledgeFolder, level = 0) => {
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const paddingLeft = level * 16 + 16;
    const articlesInFolder = state.knowledgeArticles.filter((a) => a.folderId === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-2 px-4 hover:bg-gray-50 cursor-pointer group ${
            isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div
            className="flex items-center flex-1"
            onClick={() => {
              toggleFolder(folder.id);
              setSelectedFolderId(folder.id);
              setSelectedArticleId(null);
              setViewMode('list');
            }}
          >
            <ChevronRight
              className={`h-4 w-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
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

  // ============ MAIN VIEWS ============

  const renderListView = () => {
    // If folder is selected, show folder contents
    if (selectedFolder) {
      const currentFolderArticles = state.knowledgeArticles.filter(
        (a) => a.folderId === selectedFolderId
      );

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
            <Button size="sm" onClick={handleNewArticle} icon={<Plus className="h-4 w-4" />}>
              Добавить статью
            </Button>
          </div>

          <div className="space-y-3">
            {currentFolderArticles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">В этой папке пока нет статей</p>
                <Button size="sm" onClick={handleNewArticle} className="mt-4">
                  Создать первую статью
                </Button>
              </div>
            ) : (
              currentFolderArticles.map((article) => (
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
                      {article.author} • {new Date(article.date).toLocaleDateString('ru-RU')} •{' '}
                      {article.views} просмотров
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

    // Default: show all articles
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'База знаний'}
          </h1>
          <Button size="sm" onClick={handleNewArticle} icon={<Plus className="h-4 w-4" />}>
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
              <Button size="sm" onClick={handleNewArticle} className="mt-4">
                Создать первую статью
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const contentPreview =
                typeof article.content === 'string'
                  ? article.content.replace(/<[^>]*>/g, '').substring(0, 150)
                  : '';

              return (
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
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{contentPreview}...</p>
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
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
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
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderArticleView = () => {
    if (!selectedArticle) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setViewMode('list')}
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

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{
              __html: typeof selectedArticle.content === 'string' ? selectedArticle.content : '',
            }}
          />
        </div>

        {/* Quizzes Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-2" />
              Проверочные вопросы
            </h2>
            <Button size="sm" onClick={handleNewQuiz} icon={<Plus className="h-4 w-4" />}>
              Добавить тест
            </Button>
          </div>

          {(!selectedArticle.quizzes || selectedArticle.quizzes.length === 0) ? (
            <p className="text-gray-500 text-center py-8">
              К этой статье пока нет проверочных вопросов
            </p>
          ) : (
            <div className="space-y-3">
              {selectedArticle.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {quiz.questions.length} вопросов • Проходной балл: {quiz.passingScore}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleTakeQuiz(quiz)}
                      icon={<Award className="h-4 w-4" />}
                    >
                      Пройти тест
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditQuiz(quiz)}
                      icon={<Edit2 className="h-4 w-4" />}
                    >
                      Редактировать
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEditorView = () => {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => {
              if (editingArticle) {
                setViewMode('article');
              } else {
                setViewMode('list');
              }
            }}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            {editingArticle ? 'Назад к статье' : 'Назад к списку'}
          </button>

          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {editingArticle ? 'Редактировать статью' : 'Создать статью'}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название статьи *
            </label>
            <Input
              placeholder="Введите название"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
              <Input
                placeholder="Например: HR, Продажи"
                value={articleCategory}
                onChange={(e) => setArticleCategory(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги (через запятую)
              </label>
              <Input
                placeholder="инструкция, важное"
                value={articleTags}
                onChange={(e) => setArticleTags(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Содержимое статьи *
            </label>
            <RichTextEditor content={articleContent} onChange={setArticleContent} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                if (editingArticle) {
                  setViewMode('article');
                } else {
                  setViewMode('list');
                }
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveArticle} icon={<Save className="h-4 w-4" />}>
              {editingArticle ? 'Сохранить изменения' : 'Создать статью'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizEditorView = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setViewMode('article')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Назад к статье
          </button>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {editingQuiz ? 'Редактировать тест' : 'Создать тест'}
          </h1>
          <p className="text-gray-600">
            Создайте проверочные вопросы для статьи "{selectedArticle?.title}"
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название теста *</label>
            <Input
              placeholder="Введите название теста"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          <QuizEditor
            questions={quizQuestions}
            onChange={setQuizQuestions}
            passingScore={quizPassingScore}
            onPassingScoreChange={setQuizPassingScore}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="ghost" onClick={() => setViewMode('article')}>
              Отмена
            </Button>
            <Button onClick={handleSaveQuiz} icon={<Save className="h-4 w-4" />}>
              {editingQuiz ? 'Сохранить изменения' : 'Создать тест'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizTakerView = () => {
    if (!takingQuiz) return null;

    return (
      <QuizTaker
        quizTitle={takingQuiz.title}
        questions={takingQuiz.questions}
        passingScore={takingQuiz.passingScore}
        onSubmit={handleSubmitQuiz}
        onClose={() => setViewMode('article')}
      />
    );
  };

  // ============ MAIN RENDER ============

  const renderMainContent = () => {
    switch (viewMode) {
      case 'article':
        return renderArticleView();
      case 'editor':
        return renderEditorView();
      case 'quiz-editor':
        return renderQuizEditorView();
      case 'quiz-taker':
        return renderQuizTakerView();
      default:
        return renderListView();
    }
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
      <div
        className={`fixed lg:static w-64 sm:w-80 bg-white border-r border-gray-200 flex flex-col h-screen top-0 z-50 lg:z-0 transform transition-transform lg:transform-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
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
                setViewMode('list');
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                selectedFolderId === null && viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Все статьи
            </button>
          </div>
          {state.knowledgeFolders.map((folder) => renderSidebarItem(folder))}
        </div>

        {/* Add Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={handleNewArticle}
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
        {renderMainContent()}
      </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Название папки *</label>
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
              <Button onClick={handleSaveFolder}>{editingFolder ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

