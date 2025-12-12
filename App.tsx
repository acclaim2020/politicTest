import React, { useState } from 'react';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { Button } from './components/Button';
import { UserAnswer } from './types';

enum Step {
  INTRO,
  QUIZ,
  RESULT
}

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.INTRO);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const startQuiz = () => setStep(Step.QUIZ);
  
  const finishQuiz = (collectedAnswers: UserAnswer[]) => {
    setAnswers(collectedAnswers);
    setStep(Step.RESULT);
  };

  const restart = () => {
    setAnswers([]);
    setStep(Step.INTRO);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans selection:bg-blue-100">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">K</span>
            POLITICS
          </h1>
        </div>
      </header>

      <main className="pt-20 min-h-screen flex flex-col">
        {step === Step.INTRO && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in text-center max-w-2xl mx-auto">
            <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl border border-gray-100 rotate-1 transform hover:rotate-0 transition-all duration-500">
               <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mx-auto">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
               </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              나의 정치 성향은<br/>
              <span className="text-blue-600">어디쯤일까?</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-10 max-w-md break-keep">
              경제, 사회, 안보 등 15개의 핵심 이슈에 대한 당신의 생각을 선택해주세요. 
              AI가 당신의 답변을 분석하여 구체적인 정치 성향과 유형을 알려드립니다.
            </p>

            <div className="space-y-4 w-full max-w-xs">
              <Button onClick={startQuiz} fullWidth className="text-lg py-4">
                테스트 시작하기
              </Button>
              <div className="text-xs text-gray-400">
                * 소요 시간: 약 5분
              </div>
            </div>
          </div>
        )}

        {step === Step.QUIZ && (
          <Quiz onComplete={finishQuiz} />
        )}

        {step === Step.RESULT && (
          <Result answers={answers} onRestart={restart} />
        )}
      </main>
      
      <footer className="py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} K-Politics Compass. Built with Gemini API.
      </footer>
    </div>
  );
};

export default App;
