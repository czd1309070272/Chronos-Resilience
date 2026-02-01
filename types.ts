
export interface Milestone {
  id: string;
  title: string;
  date?: string;
  status: 'completed' | 'pending' | 'long-term' | 'missed';
  category?: 'Adventure' | 'Travel' | 'Skill';
  description?: string;
  timeCapsuleUrl?: string;
  duration?: string;
  imageUrl?: string;
  estimatedAge?: number;
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  streak: number;
  lastCompleted?: string; // ISO date
}

export interface DailyTaskHistory {
  id: string;
  title: string;
  status: 'completed' | 'aborted';
  timestamp: string; // ISO date
  finalStreak: number;
}

export interface LogEntry {
  id: string;
  time: string;
  date: string;
  content: string;
  hasVoice?: boolean;
  voiceData?: string; // Base64 or Blob URL
  duration?: string;
  images?: string[]; // Array of Base64 images
  tags: { label: string; type: 'growth' | 'insight' | 'mindfulness' | 'custom' }[];
  isHighlight?: boolean;
}

export interface FutureLetter {
  content: string;
  targetDate: string; // ISO string
  createdAt: string;
  decryptionKey?: string;
  status: 'none' | 'encrypted' | 'open';
}

export interface MapLocation {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  imageUrl: string;
  coordinates: { x: number; y: number }; // Percentage values for placement on the stylized map
  isCurrent?: boolean;
}

export type ViewType = 'dashboard' | 'milestones' | 'map' | 'coach' | 'logs' | 'self' | 'settings';

export interface UserProfile {
  name: string;
  avatarUrl?: string;
}

/**
 * 從後端 API 傳回的完整用戶帳戶數據
 */
export interface UserAccount {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string | null;
}

export interface UserSettings {
  language: 'en' | 'zh-TW';
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:mm"
  lifeExpectancyPreset: 'custom' | 'average' | 'healthy';
  customLifeExpectancy: number;
  sleepOffset: number; // hours per day (target)
  todaySleepTime: number; // Actual sleep hours
  todayWorkTime: number; // Actual work hours
  workStart: string; // "HH:mm"
  workEnd: string; // "HH:mm"
  decimalPrecision: number; // 2 to 8
  progressBarStyle: 'linear' | 'orbit' | 'hourglass';
  soundEnabled: boolean;
  gravityEnabled: boolean;
  anniversaries: { id: string; name: string; date: string }[];
}

export interface CoreAttributes {
  health: number;
  mind: number;
  skill: number;
  social: number;
  adventure: number;
  spirit: number;
}

export interface UserAnalytics {
  attributes: CoreAttributes;
  soul: {
    moodStability: number;
  };
  mind: {
    focusScore: number;
    booksRead: number;
  };
}

export interface LoginApiResponse {
  success: boolean;
  user: UserProfile;
  settings: UserSettings;
  attributes: CoreAttributes;
}
