
export interface AxisScores {
  economy: number;   // +Growth, -Welfare
  society: number;   // +Order, -Liberty
  diplomacy: number; // +Alliance, -Autonomy
  approach: number;  // +Realism, -Idealism
}

export type AxisType = keyof AxisScores;

export interface Option {
  text: string;
  score: number; // Negative value (e.g. -2) favors Left/Liberty/Peace, Positive (e.g. +2) favors Right/Order/Alliance
}

export interface Question {
  id: number;
  category: string;
  text: string; // The question scenario
  axis: AxisType;
  options: Option[]; // 4 options
}

export interface AnalysisResult {
  archetype: string;      // Creative Name
  definition: string;     // 1. One sentence definition
  coreValues: string[];   // 2. 3 Key values
  unexpectedTrait: string;// 3. Unexpected twist
  scores: AxisScores;     // Normalized 0-100 for display
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  chosenOptionText: string;
  axis: AxisType;
  score: number;
}
