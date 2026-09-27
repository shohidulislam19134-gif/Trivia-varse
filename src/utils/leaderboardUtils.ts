import { LeaderboardEntry } from '../types';

const LEADERBOARD_STORAGE_KEY = 'triviaverse_local_leaderboard';
const DAILY_LEADERBOARD_PREFIX = 'triviaverse_daily_lb_';

const INITIAL_TOP_PLAYERS: LeaderboardEntry[] = [
  {
    id: 'lb_init_1',
    playerName: 'Alex "QuickDraw"',
    score: 18450,
    accuracy: 100,
    highestStreak: 10,
    totalQuestions: 10,
    correctCount: 10,
    hostName: 'Monty Sterling',
    hostEmoji: '✨🕺',
    category: 'breaking',
    difficulty: 'hard',
    playedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isVip: true,
  },
  {
    id: 'lb_init_2',
    playerName: 'Dr. Synapse',
    score: 14200,
    accuracy: 90,
    highestStreak: 7,
    totalQuestions: 10,
    correctCount: 9,
    hostName: 'Prof. Reginald Blythe',
    hostEmoji: '🧐📚',
    category: 'science',
    difficulty: 'medium',
    playedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isVip: true,
  },
  {
    id: 'lb_init_3',
    playerName: 'CyberViper',
    score: 11800,
    accuracy: 80,
    highestStreak: 5,
    totalQuestions: 8,
    correctCount: 7,
    hostName: 'Roxy Neon',
    hostEmoji: '⚡🎧',
    category: 'popculture',
    difficulty: 'medium',
    playedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isVip: false,
  },
  {
    id: 'lb_init_4',
    playerName: 'BiscuitBaron',
    score: 9350,
    accuracy: 100,
    highestStreak: 5,
    totalQuestions: 5,
    correctCount: 5,
    hostName: 'Grandma Mabel',
    hostEmoji: '🍪👵',
    category: 'general',
    difficulty: 'easy',
    playedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    isVip: false,
  },
  {
    id: 'lb_init_5',
    playerName: 'NeoGlitch',
    score: 8100,
    accuracy: 80,
    highestStreak: 4,
    totalQuestions: 5,
    correctCount: 4,
    hostName: 'UNIT-404 "Glitch"',
    hostEmoji: '🤖💾',
    category: 'history',
    difficulty: 'hard',
    playedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isVip: false,
  },
];

// Seeded global benchmark contestants for today's challenge
function generateDailySeedPlayers(dateKey: string, category: string): LeaderboardEntry[] {
  return [
    {
      id: `daily_${dateKey}_seed_1`,
      playerName: 'AstraNova',
      score: 12400,
      accuracy: 100,
      highestStreak: 5,
      totalQuestions: 5,
      correctCount: 5,
      hostName: 'Prof. Reginald Blythe',
      hostEmoji: '🧐📚',
      category: category,
      difficulty: 'hard',
      playedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isVip: true,
      isDailyChallenge: true,
      dailyChallengeDate: dateKey,
    },
    {
      id: `daily_${dateKey}_seed_2`,
      playerName: 'QuantumPilot',
      score: 10950,
      accuracy: 100,
      highestStreak: 5,
      totalQuestions: 5,
      correctCount: 5,
      hostName: 'Monty Sterling',
      hostEmoji: '✨🕺',
      category: category,
      difficulty: 'medium',
      playedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      isVip: false,
      isDailyChallenge: true,
      dailyChallengeDate: dateKey,
    },
    {
      id: `daily_${dateKey}_seed_3`,
      playerName: 'TriviaKnight',
      score: 8700,
      accuracy: 80,
      highestStreak: 4,
      totalQuestions: 5,
      correctCount: 4,
      hostName: 'Lady Seraphina',
      hostEmoji: '👑✨',
      category: category,
      difficulty: 'medium',
      playedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
      isVip: true,
      isDailyChallenge: true,
      dailyChallengeDate: dateKey,
    },
    {
      id: `daily_${dateKey}_seed_4`,
      playerName: 'CuriousMind',
      score: 6500,
      accuracy: 60,
      highestStreak: 3,
      totalQuestions: 5,
      correctCount: 3,
      hostName: 'Roxy Neon',
      hostEmoji: '⚡🎧',
      category: category,
      difficulty: 'medium',
      playedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
      isVip: false,
      isDailyChallenge: true,
      dailyChallengeDate: dateKey,
    },
  ];
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_TOP_PLAYERS));
      return INITIAL_TOP_PLAYERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    return INITIAL_TOP_PLAYERS;
  } catch (err) {
    console.error('Failed to load leaderboard from localStorage:', err);
    return INITIAL_TOP_PLAYERS;
  }
}

export function getDailyLeaderboard(dateKey: string, category: string = 'daily'): LeaderboardEntry[] {
  const key = `${DAILY_LEADERBOARD_PREFIX}${dateKey}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded = generateDailySeedPlayers(dateKey, category);
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    const seeded = generateDailySeedPlayers(dateKey, category);
    localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  } catch (err) {
    console.error('Failed to load daily leaderboard:', err);
    return generateDailySeedPlayers(dateKey, category);
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id'>): {
  entries: LeaderboardEntry[];
  rank: number;
  isNewHigh: boolean;
  dailyRank?: number;
  dailyEntries?: LeaderboardEntry[];
} {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `lb_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  // If this is a Daily Challenge round, save to specific daily competition leaderboard
  let dailyRank: number | undefined;
  let dailyEntries: LeaderboardEntry[] | undefined;

  if (entry.isDailyChallenge && entry.dailyChallengeDate) {
    const key = `${DAILY_LEADERBOARD_PREFIX}${entry.dailyChallengeDate}`;
    const currentDaily = getDailyLeaderboard(entry.dailyChallengeDate, entry.category);
    // Filter out previous attempts by the same playerName today so players can improve their daily rank
    const filteredDaily = currentDaily.filter((d) => d.playerName !== entry.playerName);
    const updatedDaily = [...filteredDaily, newEntry].sort((a, b) => b.score - a.score);
    const trimmedDaily = updatedDaily.slice(0, 50);

    try {
      localStorage.setItem(key, JSON.stringify(trimmedDaily));
    } catch (e) {}

    dailyRank = trimmedDaily.findIndex((item) => item.id === newEntry.id) + 1;
    dailyEntries = trimmedDaily;
  }

  // Also maintain all-time high scores board
  const current = getLeaderboard();
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score);
  const trimmed = updated.slice(0, 25);

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save leaderboard to localStorage:', err);
  }

  const rank = trimmed.findIndex((item) => item.id === newEntry.id) + 1;
  const isNewHigh = rank === 1;

  return {
    entries: trimmed,
    rank: rank > 0 ? rank : trimmed.length + 1,
    isNewHigh,
    dailyRank: dailyRank && dailyRank > 0 ? dailyRank : undefined,
    dailyEntries,
  };
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_TOP_PLAYERS));
  } catch (e) {}
  return INITIAL_TOP_PLAYERS;
}
