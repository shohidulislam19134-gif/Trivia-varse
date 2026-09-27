export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface HostPersonality {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  voiceName: VoiceName;
  speechStyle: string;
  avatarEmoji: string;
  themeColor: string; // Tailwind color class or hex
  glowColor: string;
  systemPrompt: string;
  sampleCatchphrase: string;
  isVip?: boolean; // Locked behind Premium / VIP pass
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  groundingSources?: GroundingSource[];
  hostDialogue?: string;
  hostMood?: 'excited' | 'dramatic' | 'smug' | 'encouraging' | 'roasting';
}

export type GameMode = 'standard' | 'daily_challenge' | 'championship' | 'survival' | 'search-breaking';

export interface DailyChallengeInfo {
  dateKey: string; // e.g. "2026-09-27"
  dayName: string; // e.g. "Sunday Spotlight"
  category: string;
  categoryName: string;
  categoryIcon: string;
  themeTitle: string;
  description: string;
  featuredHostId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

export interface GameSettings {
  category: string;
  customTopic?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  useSearchGrounding: boolean;
  autoSpeakQuestions: boolean;
  enableHostReactions: boolean;
  host: HostPersonality;
  isDailyChallenge?: boolean;
  dailyChallengeDate?: string;
}

export interface GameHistoryItem {
  question: TriviaQuestion;
  userAnswerIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
}

export type PaymentMethodType = 'paytm' | 'card' | 'upi' | 'wallet' | 'netbanking';

export interface PremiumTier {
  id: string;
  name: string;
  priceINR: number;
  priceUSD: number;
  badge: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  isPremium: boolean;
  tierId: string | null;
  tierName: string | null;
  activatedAt: string | null;
  orderId: string | null;
  paymentMethod: PaymentMethodType | null;
  txnId: string | null;
  unlimitedLifelines: boolean;
  vipHostsUnlocked: boolean;
  ultraQuestionsUnlocked: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  highestStreak: number;
  totalQuestions: number;
  correctCount: number;
  hostName: string;
  hostEmoji: string;
  category: string;
  difficulty: string;
  playedAt: string;
  isVip?: boolean;
  isDailyChallenge?: boolean;
  dailyChallengeDate?: string;
}
