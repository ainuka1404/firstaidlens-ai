export type TriageUrgency = 'GREEN' | 'YELLOW' | 'RED';

export type StepIconType = 'WATER' | 'BANDAGE' | 'PRESSURE' | 'REST' | 'ALERT';

export interface TriageInfo {
  urgency_level: TriageUrgency;
  injury_type: string;
  severity_summary: string;
  immediate_ambulance_needed: boolean;
}

export interface StepAction {
  step_number: number;
  title: string;
  instruction: string;
  timer_duration_seconds: number;
  icon_type: StepIconType;
}

export interface FirstAidAssessment {
  triage: TriageInfo;
  critical_warnings: string[];
  step_by_step_actions: StepAction[];
  operator_summary: string;
  metadata?: {
    modelUsed: string;
    inferenceLatencyMs: number;
    timestamp: string;
    imageCompressedSizeKb?: number;
    isDemoFallback?: boolean;
  };
}

export interface PresetCase {
  id: string;
  titleId: string;
  titleEn: string;
  category: string;
  urgency: TriageUrgency;
  description: string;
  thumbnailUrl: string;
  assessmentData: FirstAidAssessment;
}

export interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  addressText: string;
  loading: boolean;
  error?: string;
}

export type AppLanguage = 'id' | 'en';

export interface MascotChatMessage {
  id: string;
  sender: 'user' | 'nura';
  text: string;
  timestamp: string;
  isSpeaking?: boolean;
}
