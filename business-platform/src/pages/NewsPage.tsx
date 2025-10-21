import React, { useState } from 'react';
import { Plus, Heart, MessageCircle, Edit, Trash2, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils';
import { NewsItem } from '../types';

export function NewsPage() {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    category: '',
    allowComments: true,
  });

  const handleAddNews = () => {
    if (!newNews.content.trim()) {
      showNotification({
        message: 'Пожалуйста, введите текст новости',
        type: 'error',
      });
      return;
    }

    const newsItem: NewsItem = {
      id: Date.now(),
      title: newNews.title || 'Новость',
      content: newNews.content,
      author: 'Текущий пользователь',
      date: new Date().toISOString().split('T')[0],
      category: newNews.category || 'Общее',
      likes: 0,
      comments: [],
    };

    dispatch({ type: 'ADD_NEWS', payload: newsItem });
    setIsAddModalOpen(false);
    setNewNews({ title: '', content: '', category: '', allowComments: true });
    showNotification({
      message: 'Новость успешно добавлена!',
      type: 'success',
    });
  };

  const handleLike = (newsId: number) => {
    const news = state.news.find(n => n.id === newsId);
    if (news) {
      const updatedNews = { ...news, likes: news.likes + 1 };
      dispatch({ type: 'UPDATE_NEWS', payload: updatedNews });
      showNotification({
        message: 'Лайк добавлен!',
        type: 'success',
      });
    }
  };

  const handleDeleteNews = (newsId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      dispatch({ type: 'DELETE_NEWS', payload: newsId });
      showNotification({
        message: 'Новость удалена',
        type: 'success',
      });
    }
  };

  return (
    <div className="flex gap-6 max-w-none mx-auto px-6 py-6 bg-gray-50 min-h-screen">
      {/* Левая колонка - Новости компании */}
      <div className="flex-1 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Новости компании</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 hover:border-pink-400 hover:text-pink-600 bg-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Добавить новость
          </button>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {state.news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пока нет новостей
              </h3>
              <p className="text-gray-500">
                Добавьте первую новость, чтобы поделиться информацией с командой
              </p>
            </div>
          ) : (
            state.news.map((news) => (
              <article
                key={news.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-sm font-semibold">
                      A
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">
                        {formatDate(news.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      className="text-gray-400 hover:text-pink-600 p-1.5 rounded hover:bg-pink-50 transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(news.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed text-sm">{news.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(news.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors p-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-medium">{news.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-3 flex-1 ml-6">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold">
                      U
                    </div>
                    <input
                      type="text"
                      placeholder="Добавить комментарий"
                      className="flex-1 text-sm text-gray-500 bg-transparent border-none outline-none placeholder-gray-400 py-1"
                    />
                  </div>
                </div>

                {/* Comments */}
                {news.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                      {news.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={comment.avatar}
                            alt={comment.author}
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.date)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {/* Правая колонка - Годовщины */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Годовщины</h2>
          
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                {/* Main gift icon */}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Gift className="h-6 w-6 text-pink-400" />
                  </div>
                </div>
                
                {/* Confetti decorations - more realistic positioning */}
                <div className="absolute top-4 left-8 w-2 h-2 bg-orange-300 rounded-full opacity-70 transform rotate-12"></div>
                <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-70 transform -rotate-12"></div>
                <div className="absolute bottom-8 left-6 w-1 h-1 bg-yellow-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-4 right-8 w-2 h-2 bg-red-300 rounded-full opacity-70 transform rotate-45"></div>
                <div className="absolute top-2 right-12 w-1 h-1 bg-blue-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-green-300 rounded-full opacity-70 transform -rotate-45"></div>
                <div className="absolute top-12 left-4 w-1 h-1 bg-purple-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-6 right-4 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-70"></div>
                
                {/* Additional scattered elements */}
                <div className="absolute top-6 left-12 w-1 h-3 bg-yellow-300 rounded-full opacity-60 transform rotate-45"></div>
                <div className="absolute bottom-10 right-12 w-1 h-3 bg-pink-300 rounded-full opacity-60 transform -rotate-45"></div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              В ближайшее время нет годовщин
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed px-2">
              Дни рождения и круглые даты автоматически будут отображаться здесь
            </p>
          </div>
        </div>
      </div>

      {/* Add News Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title=""
        size="lg"
      >
        <div className="space-y-6">
          {/* Header with date */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
            <span>29.09.2025, 12:31</span>
          </div>

          {/* Title input */}
          <div>
            <input
              type="text"
              className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
              value={newNews.title}
              onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              placeholder="Введите заголовок новости"
            />
          </div>

          {/* Content textarea */}
          <div>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={6}
              value={newNews.content}
              onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              placeholder="Введите описание новости"
            />
          </div>

          {/* File attachment */}
          <div className="flex items-center text-gray-500">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm underline cursor-pointer">Прикрепить файл</span>
          </div>

          {/* Comments checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disableComments"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              checked={!newNews.allowComments}
              onChange={(e) => setNewNews({ ...newNews, allowComments: !e.target.checked })}
            />
            <label htmlFor="disableComments" className="ml-2 text-sm text-gray-700">
              Выключить комментарии
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleAddNews}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Опубликовать
            </button>
            <button
              className="px-4 py-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


