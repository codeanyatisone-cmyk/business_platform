import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, Image } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export function EventsPage() {
  const { state } = useApp();
  const { showNotification } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Фильтры
  const [nameFilter, setNameFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventDateFilter, setEventDateFilter] = useState('');

  // Форма нового мероприятия
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: '',
    employees: '',
    positions: '',
    startDate: '',
    endDate: '',
    startTime: '17:12',
    endTime: '18:12',
    duration: '1',
    durationType: 'hours',
    description: '',
    image: null as File | null
  });

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Получение дней месяца
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0

    const days = [];
    
    // Добавляем пустые дни в начале
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      showNotification({
        message: 'Пожалуйста, введите название мероприятия',
        type: 'error',
      });
      return;
    }

    // Здесь будет логика добавления мероприятия
    showNotification({
      message: 'Мероприятие успешно добавлено!',
      type: 'success',
    });
    
    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      category: '',
      employees: '',
      positions: '',
      startDate: '',
      endDate: '',
      startTime: '17:12',
      endTime: '18:12',
      duration: '1',
      durationType: 'hours',
      description: '',
      image: null
    });
  };

  const filteredEvents = useMemo(() => {
    return state.events.filter(event => {
      const matchesName = !nameFilter || event.title.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesDescription = !descriptionFilter || event.description?.toLowerCase().includes(descriptionFilter.toLowerCase());
      const matchesCategory = !categoryFilter || event.category === categoryFilter;
      return matchesName && matchesDescription && matchesCategory;
    });
  }, [state.events, nameFilter, descriptionFilter, categoryFilter]);

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Календарь
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Список
            </button>
          </div>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          icon={<Plus className="h-4 w-4" />}
        >
          Добавить мероприятие
        </Button>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.getFullYear()} {monthNames[currentDate.getMonth()]}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Сегодня
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm text-gray-600">Предыдущий месяц</span>
                  <span className="text-sm text-gray-600">Сегодня</span>
                  <span className="text-sm text-gray-600">Следующий месяц</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Week headers */}
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {days.map((date, index) => (
                <div
                  key={index}
                  className={`p-2 h-20 border border-gray-100 ${
                    date && isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50'
                  } ${
                    date && isToday(date) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {date && (
                    <div
                      className={`text-sm ${
                        isToday(date) ? 'text-blue-600 font-semibold' : 
                        isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* List View Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Фильтры</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                label="Название"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Поиск по названию"
              />
              <Input
                label="Описание"
                value={descriptionFilter}
                onChange={(e) => setDescriptionFilter(e.target.value)}
                placeholder="Поиск по описанию"
              />
              <Select
                label="Категория"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'Все категории' },
                  { value: 'meeting', label: 'Встреча' },
                  { value: 'training', label: 'Обучение' },
                  { value: 'event', label: 'Мероприятие' }
                ]}
              />
              <Select
                label="Тип события"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                options={[
                  { value: '', label: 'Все типы' },
                  { value: 'internal', label: 'Внутреннее' },
                  { value: 'external', label: 'Внешнее' }
                ]}
              />
              <Input
                type="date"
                label="Дата события"
                value={eventDateFilter}
                onChange={(e) => setEventDateFilter(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Button
                variant="secondary"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                Фильтровать
              </Button>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет мероприятий
                </h3>
                <p className="text-gray-500">
                  Добавьте первое мероприятие, чтобы начать планирование
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-semibold"
                          src="https://via.placeholder.com/40x40/f44336/fff?text=А"
                          alt="Event"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time || '17:12'}, 1ч
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <span>Пойду</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span>Не пойду</span>
                        </button>
                        <button className="text-gray-400 hover:text-pink-600 p-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-gray-400 hover:text-red-600 p-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Новое мероприятие"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название *"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Название"
            />
            <Select
              label="Категория"
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              options={[
                { value: '', label: 'Выбрать' },
                { value: 'meeting', label: 'Встреча' },
                { value: 'training', label: 'Обучение' },
                { value: 'event', label: 'Мероприятие' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Для сотрудников
              </label>
              <input
                type="text"
                value={newEvent.employees}
                onChange={(e) => setNewEvent({ ...newEvent, employees: e.target.value })}
                placeholder="Укажите нужных сотрудников"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Для должностей
              </label>
              <input
                type="text"
                value={newEvent.positions}
                onChange={(e) => setNewEvent({ ...newEvent, positions: e.target.value })}
                placeholder="Укажите нужные должности"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Время проведения</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mt-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продолжительность</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    min="1"
                  />
                  <select
                    value={newEvent.durationType}
                    onChange={(e) => setNewEvent({ ...newEvent, durationType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="minutes">Минут</option>
                    <option value="hours">Часов</option>
                    <option value="days">Дней</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Завершение</label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 mt-2"
                />
              </div>
            </div>

            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Добавить бронь
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Описание"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Картинка
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Перетащите сюда файлы или нажмите на область</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}





