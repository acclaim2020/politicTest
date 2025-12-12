
import React, { useEffect, useState } from 'react';
import { UserAnswer, AnalysisResult } from '../types';
import { generateAnalysis } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Button } from './Button';

interface ResultProps {
  answers: UserAnswer[];
  onRestart: () => void;
}

const fetchAnalysisResult = async (answers: UserAnswer[]) => {
// 1. 서버리스 함수 엔드포인트로 POST 요청
  const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      // body에 분석에 필요한 데이터 전송
      body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
      throw new Error('Analysis failed on the server.');
  }

  const result = await response.json();
  return result; // AnalysisResult 객체 반환
};

export const Result: React.FC<ResultProps> = ({ answers, onRestart }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const processResults = async () => {
      try {
        const result = await fetchAnalysisResult(answers);
        setAnalysis(result);



        const data = [
          { subject: '경제 (성장)', A: result.scores.economy, fullMark: 100 },
          { subject: '사회 (질서)', A: result.scores.society, fullMark: 100 },
          { subject: '외교 (안보)', A: result.scores.diplomacy, fullMark: 100 },
          { subject: '태도 (현실)', A: result.scores.approach, fullMark: 100 },
        ];
        setChartData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    processResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      alert("링크가 복사되었습니다. 친구들에게 공유해보세요!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleTwitter = () => {
    if (!analysis) return;
    const text = `나의 정치 성향은 [${analysis.archetype}] 입니다. 당신의 성향도 확인해보세요! #정치성향테스트`;
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleFacebook = () => {
    const url = window.location.origin;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">당신의 정치 성향 분석</h2>
        <p className="text-gray-500">4가지 핵심 축을 기반으로 분석된 결과입니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-700 mb-2">성향 다이어그램</h3>
          <div className="w-full h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="My Result"
                  dataKey="A"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
            
            {/* Axis Legends */}
            <div className="absolute top-0 left-0 text-xs text-gray-400">
               <span className="font-bold text-blue-600">중심(50)</span> = 중도
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full mt-4 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl">
             <div><span className="font-bold">경제:</span> 성장(100) vs 분배(0)</div>
             <div><span className="font-bold">사회:</span> 질서(100) vs 자유(0)</div>
             <div><span className="font-bold">외교:</span> 동맹(100) vs 자주(0)</div>
             <div><span className="font-bold">태도:</span> 현실(100) vs 이상(0)</div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse">데이터 분석 중...</p>
              <p className="text-xs text-gray-400">당신의 선택을 심층 분석하고 있습니다.</p>
            </div>
          ) : analysis ? (
            <div className="flex-1 space-y-8">
              {/* Header & Definition */}
              <div className="text-left">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">MY ARCHETYPE</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">{analysis.archetype}</h3>
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                  "{analysis.definition}"
                </p>
              </div>

              {/* Core Values */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  핵심 가치
                </h4>
                <div className="space-y-3">
                  {analysis.coreValues.map((val, idx) => {
                    const [key, ...rest] = val.split(':');
                    const value = rest.join(':');
                    return (
                      <div key={idx} className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider min-w-fit">{key}</span>
                        <span className="hidden md:block text-slate-300">|</span>
                        <span className="text-sm text-slate-700 font-medium">{value || key}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unexpected Trait (Twist) */}
              <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
                <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 text-lg">
                  💡
                </div>
                <h4 className="font-bold text-indigo-900 mb-2 text-sm">의외의 면모</h4>
                <p className="text-indigo-800 text-sm leading-relaxed italic">
                  {analysis.unexpectedTrait}
                </p>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-red-500">
              분석 실패. 다시 시도해주세요.
            </div>
          )}
        </div>
      </div>

      {/* Share & Action Buttons */}
      <div className="flex flex-col items-center gap-6 pb-12">
        {!loading && (
          <div className="flex flex-col items-center gap-3">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">결과 공유하기</h4>
            <div className="flex gap-4">
              <button 
                onClick={handleCopyLink}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all hover:scale-110"
                title="링크 복사"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              
              <button 
                onClick={handleTwitter}
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-all hover:scale-110"
                title="트위터(X) 공유"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              
              <button 
                onClick={handleFacebook}
                className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-blue-600 flex items-center justify-center text-white transition-all hover:scale-110"
                title="페이스북 공유"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.66-2.797 3.54v1.23h3.67l-.641 3.676h-3.029v7.98H9.101Z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <Button onClick={onRestart} className="w-full md:w-auto min-w-[240px] shadow-xl hover:shadow-2xl hover:-translate-y-1 py-4 text-lg">
          처음부터 다시하기
        </Button>
      </div>
    </div>
  );
};
