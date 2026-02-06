
export interface DiagramData {
  id: string;
  concept: string;
  imageUrl: string;
  description: string;
  labels: string[];
  quizQuestions: QuizQuestion[];
  createdAt: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudyDeck {
  id: string;
  title: string;
  description: string;
  tag: string;
  diagrams: DiagramData[];
  createdAt: number;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  GENERATING = 'GENERATING',
  STUDYING = 'STUDYING',
  LIBRARY = 'LIBRARY'
}
