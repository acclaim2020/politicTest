import React, { useState, useEffect } from 'react';
import { QUESTIONS } from '../constants';
import { UserAnswer, Question, Option } from '../types';

interface QuizProps {
  onComplete: (answers: UserAnswer[]) => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [fadeKey, setFadeKey] = useState(0);

  // Initialize: Shuffle and pick 15 questions
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 15));
  }, []);

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;

  const handleResponse = (option: Option) => {
    if (!currentQuestion) return;

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      chosenOptionText: option.text,
      axis: currentQuestion.axis,
      score: option.score
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      setFadeKey(prev => prev + 1);
      setCurrentIdx(prev => prev + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500">질문지를 섞고 있습니다...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
          <span>문항 {currentIdx + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div key={fadeKey} className="animate-fade-in">
        {/* Question Card */}
        <div className="mb-8 min-h-[140px] flex flex-col justify-center">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-3 border border-blue-100">
              {currentQuestion.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug break-keep">
              "{currentQuestion.text}"
            </h2>
          </div>
        </div>

        {/* 4 Choice Options */}
        <div className="grid gap-3 md:gap-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={`${currentQuestion.id}-${idx}`} // Use unique key to force re-render
              onClick={(e) => {
                e.currentTarget.blur(); // Remove focus immediately
                handleResponse(option);
              }}
              className="w-full p-4 md:p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-md text-gray-700 hover:text-blue-700 font-medium text-base md:text-lg transition-all duration-200 active:scale-[0.98] text-left leading-snug group flex items-start"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 mr-4 mt-0.5 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </span>
              <span className="break-keep">{option.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};