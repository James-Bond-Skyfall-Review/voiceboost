export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TutorState {
  proficiency: ProficiencyLevel;
  messages: Message[];
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  speechRate: number;
  error: string | null;
}

export interface DebugLog {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'success';
  message: string;
}
