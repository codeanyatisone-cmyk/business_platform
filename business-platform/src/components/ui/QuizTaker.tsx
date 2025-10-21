import React, { useState } from 'react';
import { Check, X, Award, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { QuizQuestion } from './QuizEditor';

interface QuizTakerProps {
  quizTitle: string;
  questions: QuizQuestion[];
  passingScore: number;
  onSubmit: (answers: any[]) => void;
  onClose: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({
  quizTitle,
  questions,
  passingScore,
  onSubmit,
  onClose,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>(new Array(questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
  } | null>(null);

  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate results
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      
      if (question.type === 'single') {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === 'multiple') {
        const correctAnswerSet = new Set(question.correctAnswers || []);
        const userAnswerSet = new Set(userAnswer || []);
        
        if (
          correctAnswerSet.size === userAnswerSet.size &&
          Array.from(correctAnswerSet).every(a => userAnswerSet.has(a))
        ) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= passingScore;

    setResults({ score, passed, correctAnswers });
    setIsSubmitted(true);

    // Call onSubmit callback
    onSubmit(answers);
  };

  const handleRetry = () => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setIsSubmitted(false);
    setResults(null);
  };

  const question = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const allAnswered = answers.every(a => a !== null && (Array.isArray(a) ? a.length > 0 : true));

  // Results View
  if (isSubmitted && results) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div
            className={`mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center ${
              results.passed
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {results.passed ? (
              <Award className="h-12 w-12" />
            ) : (
              <X className="h-12 w-12" />
            )}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {results.passed ? 'Поздравляем!' : 'Не пройдено'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {results.passed
              ? 'Вы успешно прошли тест!'
              : 'К сожалению, вы не набрали проходной балл.'}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">{results.score}%</div>
                <div className="text-sm text-gray-600">Ваш результат</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-700">
                  {results.correctAnswers}/{questions.length}
                </div>
                <div className="text-sm text-gray-600">Правильных ответов</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-3">
            <Button onClick={handleRetry} icon={<RefreshCw className="h-4 w-4" />}>
              Пройти еще раз
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Вопрос {currentQuestion + 1} из {questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.type === 'single' ? (
            // Single Choice
            question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                  currentAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {currentAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))
          ) : (
            // Multiple Choice
            question.options.map((option, index) => {
              const isSelected =
                Array.isArray(currentAnswer) && currentAnswer.includes(index);

              return (
                <button
                  key={index}
                  onClick={() => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const newAnswer = isSelected
                      ? current.filter((i) => i !== index)
                      : [...current, index];
                    handleAnswer(newAnswer);
                  }}
                  className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {question.type === 'multiple' && (
          <p className="text-xs text-gray-500 mt-3">
            * Выберите все правильные варианты
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Назад
        </Button>

        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index] !== null
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            Завершить тест
          </Button>
        ) : (
          <Button onClick={handleNext}>Далее</Button>
        )}
      </div>
    </div>
  );
};

