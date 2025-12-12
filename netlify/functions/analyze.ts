import { GoogleGenAI, Type } from "@google/genai";
// 필요한 경우, UserAnswer, AnalysisResult 등 타입 정의를 가져와야 합니다.

import { UserAnswer, AnalysisResult, AxisScores } from "../../types";

// Netlify Functions의 기본 핸들러 함수 구조
exports.handler = async (event) => {
    // 1. HTTP POST 요청 본문(body)에서 사용자 답변 데이터 파싱
    
    let answers: UserAnswer[];
    const data = JSON.parse(event.body);

    answers = data.answers;

    const scores: AxisScores = {
    economy: 0,
    society: 0,
    diplomacy: 0,
    approach: 0
  };

  // Track max possible absolute score to normalize
  // Since we pick 15 questions, and max abs value is 2, max score per axis depends on random pick.
  // We'll normalize based on the *actual* questions asked for that axis.
    const maxPotential: AxisScores = {
        economy: 0,
        society: 0,
        diplomacy: 0,
        approach: 0
    };

    answers.forEach(a => {
        scores[a.axis] += a.score;
        maxPotential[a.axis] += 2; // Assuming max absolute value is 2
    });

    // Normalize to 0-100 scale
    // Raw score is between -Max and +Max.
    // Formula: ((Raw / Max) + 1) * 50
    const normalize = (val: number, max: number) => {
        if (max === 0) return 50;
        const ratio = val / max; 
        return Math.round((ratio + 1) * 50);
    };

    const normalizedScores: AxisScores = {
        economy: normalize(scores.economy, maxPotential.economy),
        society: normalize(scores.society, maxPotential.society),
        diplomacy: normalize(scores.diplomacy, maxPotential.diplomacy),
        approach: normalize(scores.approach, maxPotential.approach),
    };


    try {
        // API Key를 Netlify 환경 변수에서 안전하게 가져옴
        const apiKey = process.env.GEMINI_API_KEY; // Netlify에서 설정할 변수명

        if (!apiKey) {
             return { statusCode: 500, body: JSON.stringify({ error: "API Key is missing." }) };
        }

        const ai = new GoogleGenAI({ apiKey });

        // Prepare a summary for the prompt
        // We include the chosen option text for context
        const answerSummary = answers.map(a => 
        `- 질문: "${a.questionText}" \n  -> 선택: "${a.chosenOptionText}" (축: ${a.axis}, 점수: ${a.score})`
        ).join("\n");

        const scoreSummary = `
        최종 점수 (0~100, 50이 중립):
        - 경제 (0:진보/분배 ~ 100:보수/성장): ${normalizedScores.economy}
        - 사회 (0:진보/자유 ~ 100:보수/질서): ${normalizedScores.society}
        - 외교 (0:진보/자주 ~ 100:보수/동맹): ${normalizedScores.diplomacy}
        - 태도 (0:진보/이상 ~ 100:보수/현실): ${normalizedScores.approach}
        `;

        const prompt = `
        당신은 대한민국 정치 지형을 꿰뚫고 있는 전문가입니다.
        사용자가 15개의 정치/사회 현안 질문에 대해 선택한 답변은 다음과 같습니다.
        
        [점수 데이터]
        ${scoreSummary}

        [사용자 답변 상세]
        ${answerSummary}

        [요청 사항]
        이 데이터를 바탕으로 사용자의 정치적 페르소나(Archetype)를 분석하여 다음 3단계 구조로 결과를 출력해주세요.
        
        1. Archetype 이름: MBTI 유형처럼 직관적이고 창의적인 4~8글자 이름 (예: "냉철한 전략가", "따뜻한 개혁가")
        2. 강렬한 정의 (definition): 당신의 유형이 어떤 사람인지 한 문장으로 압축하여 흥미를 유발하세요.
            - 예시: "당신은 불안정한 시장을 바로잡기 위해 공적 개입을 망설이지 않는 냉철한 사령관입니다."
        3. 핵심 가치 (coreValues): 이 유형이 가장 중요하게 생각하는 가치나 신념을 3가지로 정리하세요. 
            - 반드시 "키워드: 내용" 형식을 지킬 것.
            - 예시: ["최우선 가치: 분배 정의", "행동 원칙: 정부의 적극적 역할", "주요 우려: 사회적 불평등 심화"]
        4. 의외의 특징 (unexpectedTrait): 같은 성향의 사람들도 공감할 만한 의외의 강점이나 약점, 혹은 반전 매력을 한 문장으로 기술하세요.
            - 예시: "겉으로는 냉철하지만, 약자에게는 누구보다 따뜻한 감성을 숨기고 있습니다."

        반드시 JSON 형식으로 출력하세요.
        `;

        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                archetype: { type: Type.STRING, description: "Persona name" },
                definition: { type: Type.STRING, description: "One sentence definition" },
                coreValues: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3 Core values strings" 
                },
                unexpectedTrait: { type: Type.STRING, description: "Twist or unexpected trait" }
            },
            required: ["archetype", "definition", "coreValues", "unexpectedTrait"]
            }
        }
        });

        if (response.text) {
        const result = JSON.parse(response.text) as AnalysisResult;
        result.scores = normalizedScores; // Append local calculation
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result) // AnalysisResult 객체
        };
    }


        // 2. prompt 구성 및 Gemini API 호출 로직 (기존 generateAnalysis.ts의 핵심 로직)
        // ... (API 호출 및 응답 처리 로직) ...

        // 3. 분석 결과를 클라이언트로 반환
        

    } catch (error) {
        console.error("Gemini analysis failed:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error during analysis.', details: error.message }),
        };
    }
};
