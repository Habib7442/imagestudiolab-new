export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface TopicConcept {
  concept: string;
  description: string;
  significance?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  key_takeaway?: string;
}

export type TargetLevel = 
  | 'class_9' | 'class_10' | 'class_11' | 'class_12'
  | 'eng_cs' | 'eng_mech' | 'eng_civil' | 'eng_elec' | 'eng_chem'
  | 'med_mbbs' | 'med_nursing' | 'med_dental' | 'med_pharmacy';
