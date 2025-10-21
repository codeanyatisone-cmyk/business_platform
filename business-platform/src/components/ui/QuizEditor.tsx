import React, { useState } from 'react';
import { Plus, Trash2, Check, X, GripVertical } from 'lucide-react';
import { Button } from './Button';

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple';
  question: string;
  options: string[];
  correctAnswer?: number; // For single choice
  correctAnswers?: number[]; // For multiple choice
}

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  passingScore: number;
  onPassingScoreChange: (score: number) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  questions,
  onChange,
  passingScore,
  onPassingScoreChange,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      type: 'single',
      question: '',
      options: ['', ''],
      correctAnswer: 0,
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    onChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, ''],
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const toggleCorrectAnswer = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'single') {
      updateQuestion(questionId, { correctAnswer: optionIndex });
    } else {
      const currentAnswers = question.correctAnswers || [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((i) => i !== optionIndex)
        : [...currentAnswers, optionIndex];
      updateQuestion(questionId, { correctAnswers: newAnswers });
    }
  };

  const isCorrectAnswer = (question: QuizQuestion, optionIndex: number): boolean => {
    if (question.type === 'single') {
      return question.correctAnswer === optionIndex;
    } else {
      return question.correctAnswers?.includes(optionIndex) || false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Passing Score */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Проходной балл (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={passingScore}
          onChange={(e) => onPassingScoreChange(Number(e.target.value))}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-600 mt-2">
          Минимальный процент правильных ответов для прохождения теста
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Question Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setExpandedQuestion(
                  expandedQuestion === question.id ? null : question.id
                )
              }
            >
              <div className="flex items-center space-x-3 flex-1">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">
                  Вопрос {qIndex + 1}
                </span>
                {question.question && (
                  <span className="text-sm text-gray-600 truncate">
                    {question.question}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuestion(question.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Question Body */}
            {expandedQuestion === question.id && (
              <div className="p-4 pt-0 space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип вопроса
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        type: e.target.value as 'single' | 'multiple',
                        ...(e.target.value === 'single'
                          ? { correctAnswer: 0, correctAnswers: undefined }
                          : { correctAnswers: [], correctAnswer: undefined }),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Один правильный ответ</option>
                    <option value="multiple">Несколько правильных ответов</option>
                  </select>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст вопроса *
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, { question: e.target.value })
                    }
                    placeholder="Введите вопрос..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Варианты ответов
                  </label>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        {/* Correct Answer Indicator */}
                        <button
                          onClick={() => toggleCorrectAnswer(question.id, oIndex)}
                          className={`p-2 rounded border-2 transition-colors ${
                            isCorrectAnswer(question, oIndex)
                              ? 'bg-green-100 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                          title={
                            question.type === 'single'
                              ? 'Пометить как правильный ответ'
                              : 'Переключить правильность ответа'
                          }
                        >
                          <Check className="h-4 w-4" />
                        </button>

                        {/* Option Input */}
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, oIndex, e.target.value)
                          }
                          placeholder={`Вариант ${oIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Delete Option */}
                        {question.options.length > 2 && (
                          <button
                            onClick={() => deleteOption(question.id, oIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Option Button */}
                  <button
                    onClick={() => addOption(question.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить вариант
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <Button
        onClick={addQuestion}
        variant="secondary"
        icon={<Plus className="h-4 w-4" />}
        className="w-full"
      >
        Добавить вопрос
      </Button>

      {/* Info */}
      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Добавьте первый вопрос для теста</p>
        </div>
      )}
    </div>
  );
};

