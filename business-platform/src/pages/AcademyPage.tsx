import React, { useState } from 'react';
import { Search, Plus, Users, BookOpen, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../hooks/useNotification';
import { Course, Program } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function AcademyPage() {
  const { state, dispatch } = useApp();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<'courses' | 'programs'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  
  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft' as 'active' | 'draft',
  });
  
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    courseIds: [] as number[],
  });

  // Get selected course
  const selectedCourse = state.courses.find(c => c.id === selectedCourseId);

  // Filter courses
  const filteredCourses = state.courses.filter(course =>
    !searchQuery || course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter programs
  const filteredPrograms = state.programs.filter(program =>
    !searchQuery || program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle save course
  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) {
      showNotification({ message: 'Введите название курса', type: 'error' });
      return;
    }

    const currentUser = state.employees[0];
    
    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category,
        status: courseForm.status,
        lastUpdated: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_COURSE', payload: updated });
      showNotification({ message: 'Курс обновлен', type: 'success' });
    } else {
      const newCourse: Course = {
        id: Date.now(),
        title: courseForm.title,
        description: courseForm.description,
        category: courseForm.category || 'Общее',
        author: currentUser?.name || 'Текущий пользователь',
        authorId: currentUser?.id || 1,
        participants: [],
        views: 0,
        lastUpdated: new Date().toISOString(),
        status: courseForm.status,
        lessons: [],
      };
      dispatch({ type: 'ADD_COURSE', payload: newCourse });
      showNotification({ message: 'Курс создан', type: 'success' });
    }
    
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ title: '', description: '', category: '', status: 'draft' });
  };

  // Handle save program
  const handleSaveProgram = () => {
    if (!programForm.title.trim()) {
      showNotification({ message: 'Введите название программы', type: 'error' });
      return;
    }

    const currentUser = state.employees[0];
    
    if (editingProgram) {
      const updated: Program = {
        ...editingProgram,
        title: programForm.title,
        description: programForm.description,
        courseIds: programForm.courseIds,
      };
      dispatch({ type: 'UPDATE_PROGRAM', payload: updated });
      showNotification({ message: 'Программа обновлена', type: 'success' });
    } else {
      const newProgram: Program = {
        id: Date.now(),
        title: programForm.title,
        description: programForm.description,
        participants: [],
        courseIds: programForm.courseIds,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Текущий пользователь',
      };
      dispatch({ type: 'ADD_PROGRAM', payload: newProgram });
      showNotification({ message: 'Программа создана', type: 'success' });
    }
    
    setShowProgramModal(false);
    setEditingProgram(null);
    setProgramForm({ title: '', description: '', courseIds: [] });
  };

  // Handle delete course
  const handleDeleteCourse = (courseId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      dispatch({ type: 'DELETE_COURSE', payload: courseId });
      showNotification({ message: 'Курс удален', type: 'success' });
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
      }
    }
  };

  // Handle delete program
  const handleDeleteProgram = (programId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту программу?')) {
      dispatch({ type: 'DELETE_PROGRAM', payload: programId });
      showNotification({ message: 'Программа удалена', type: 'success' });
    }
  };

  // Handle edit course
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category,
      status: course.status,
    });
    setShowCourseModal(true);
  };

  // Handle edit program
  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramForm({
      title: program.title,
      description: program.description,
      courseIds: program.courseIds,
    });
    setShowProgramModal(true);
  };

  // Handle toggle course in program
  const toggleCourseInProgram = (courseId: number) => {
    setProgramForm(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId]
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-600" />
              Академия
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Управление курсами и программами обучения</p>
          </div>
          <Button
            onClick={() => activeTab === 'courses' ? setShowCourseModal(true) : setShowProgramModal(true)}
            icon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            {activeTab === 'courses' ? 'Создать курс' : 'Создать программу'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего курсов</h3>
            <div className="text-3xl font-bold text-gray-900">{state.courses.length}</div>
            <p className="text-sm text-gray-500 mt-1">
              Активных: {state.courses.filter(c => c.status === 'active').length}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Программ обучения</h3>
            <div className="text-3xl font-bold text-blue-600">{state.programs.length}</div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего просмотров</h3>
            <div className="text-3xl font-bold text-green-600">
              {state.courses.reduce((acc, c) => acc + c.views, 0)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-1 sm:mr-2" />
            Курсы
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'programs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="h-4 w-4 inline mr-2" />
            Программы
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Поиск ${activeTab === 'courses' ? 'курсов' : 'программ'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'courses' ? (
        <div>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'Курсы не найдены' : 'Курсы еще не созданы'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCourseModal(true)} className="mt-4">
                  Создать первый курс
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Course Header */}
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'active' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-500 text-white'
                      }`}>
                        {course.status === 'active' ? 'Активен' : 'Черновик'}
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div>Автор: {course.author}</div>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.participants.length}
                        </span>
                        <span>{course.views} просмотров</span>
                      </div>
                      {course.category && (
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block">
                          {course.category}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCourse(course)}
                        icon={<Edit2 className="h-4 w-4" />}
                        className="flex-1"
                      >
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCourse(course.id)}
                        icon={<Trash2 className="h-4 w-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? 'Программы не найдены' : 'Программы еще не созданы'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowProgramModal(true)} className="mt-4">
                  Создать первую программу
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrograms.map((program) => {
                const programCourses = state.courses.filter(c => program.courseIds.includes(c.id));
                
                return (
                  <div
                    key={program.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{program.title}</h3>
                          <p className="text-sm text-gray-600">{program.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {program.participants.length} участников
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {programCourses.length} курсов
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditProgram(program)}
                          icon={<Edit2 className="h-4 w-4" />}
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProgram(program.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>

                    {/* Program Courses */}
                    {programCourses.length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Курсы программы:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {programCourses.map((course, idx) => (
                            <div key={course.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-medium text-sm">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                                <p className="text-xs text-gray-500">{course.author}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <Modal
          isOpen={showCourseModal}
          onClose={() => {
            setShowCourseModal(false);
            setEditingCourse(null);
            setCourseForm({ title: '', description: '', category: '', status: 'draft' });
          }}
          title={editingCourse ? 'Редактировать курс' : 'Создать курс'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название курса *
              </label>
              <Input
                placeholder="Введите название"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="Описание курса..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <Input
                placeholder="Например: Менеджмент, Разработка"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as 'active' | 'draft' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="draft">Черновик</option>
                <option value="active">Активен</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  setCourseForm({ title: '', description: '', category: '', status: 'draft' });
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveCourse}>
                {editingCourse ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Program Modal */}
      {showProgramModal && (
        <Modal
          isOpen={showProgramModal}
          onClose={() => {
            setShowProgramModal(false);
            setEditingProgram(null);
            setProgramForm({ title: '', description: '', courseIds: [] });
          }}
          title={editingProgram ? 'Редактировать программу' : 'Создать программу'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название программы *
              </label>
              <Input
                placeholder="Введите название"
                value={programForm.title}
                onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Описание программы..."
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Курсы программы ({programForm.courseIds.length})
              </label>
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {state.courses.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Нет доступных курсов
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {state.courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={programForm.courseIds.includes(course.id)}
                          onChange={() => toggleCourseInProgram(course.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.author}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowProgramModal(false);
                  setEditingProgram(null);
                  setProgramForm({ title: '', description: '', courseIds: [] });
                }}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveProgram}>
                {editingProgram ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
