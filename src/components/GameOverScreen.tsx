import React, { useState, useEffect } from 'react';
import { HostPersonality, GameHistoryItem, GameSettings, UserSubscription, LeaderboardEntry } from '../types';
import { getLeaderboard, getDailyLeaderboard, saveLeaderboardEntry } from '../utils/leaderboardUtils';
import { getTodaysChallenge } from '../data/dailyChallenge';
import { MotionConfetti } from './MotionConfetti';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Search,
  Crown,
  Medal,
  UserCheck,
  TrendingUp,
  Award,
  Calendar,
  Globe2,
  Share2,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highestStreak: number;
  history: GameHistoryItem[];
  host: HostPersonality;
  settings: GameSettings;
  subscription: UserSubscription;
  hostFinalCommentary: string;
  isSpeaking: boolean;
  onReplayCommentary: () => void;
  onPlayAgain: () => void;
  onChangeHost: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highestStreak,
  history,
  host,
  settings,
  subscription,
  hostFinalCommentary,
  isSpeaking,
  onReplayCommentary,
  onPlayAgain,
  onChangeHost,
}) => {
  const correctCount = history.filter((h) => h.isCorrect).length;
  const totalCount = history.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const todayChallenge = getTodaysChallenge();
  const isDaily = !!settings.isDailyChallenge;
  const dailyDateKey = settings.dailyChallengeDate || todayChallenge.info.dateKey;

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('triviaverse_player_name') || 'Contestant';
    } catch (e) {
      return 'Contestant';
    }
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerDailyRank, setPlayerDailyRank] = useState<number | null>(null);
  const [isHighScore, setIsHighScore] = useState(false);
  const [showFramerConfetti, setShowFramerConfetti] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'leaderboard' | 'review'>(
    isDaily ? 'daily' : 'leaderboard'
  );

  // Generate shareable snippet
  const generateShareSnippet = () => {
    const modeLabel = isDaily ? `Challenge of the Day (${todayChallenge.info.themeTitle})` : `${settings.category.toUpperCase()} Trivia`;
    const rankInfo = isDaily && playerDailyRank ? `🏆 Global Rank: #${playerDailyRank}\n` : playerRank ? `🎖️ Leaderboard Rank: #${playerRank}\n` : '';
    return `🎯 TRIVIAVERSE SHOWDOWN!\n` +
      `👤 Contestant: ${playerName}\n` +
      `🔥 Score: ${score.toLocaleString()} pts\n` +
      `⚡ Max Streak: ${highestStreak}x in a row\n` +
      `🎯 Accuracy: ${accuracy}% (${correctCount}/${totalCount})\n` +
      rankInfo +
      `🎙️ Host: ${host.name} ${host.avatarEmoji}\n` +
      `🕹️ Mode: ${modeLabel}\n\n` +
      `Think you can top my score? Enter the Triviaverse! ⚡`;
  };

  const handleShareTwitter = () => {
    const text = generateShareSnippet();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = generateShareSnippet();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShare = async () => {
    const text = generateShareSnippet();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  useEffect(() => {
    // Load existing leaderboards on mount
    const entries = getLeaderboard();
    setLeaderboard(entries);

    const dailyEntries = getDailyLeaderboard(dailyDateKey, settings.category);
    setDailyLeaderboard(dailyEntries);

    // Auto-record the score if score > 0 and not yet recorded
    if (score > 0 && !hasSubmitted) {
      const defaultName = localStorage.getItem('triviaverse_player_name') || 'Contestant';
      const result = saveLeaderboardEntry({
        playerName: defaultName,
        score,
        accuracy,
        highestStreak,
        totalQuestions: totalCount,
        correctCount,
        hostName: host.name,
        hostEmoji: host.avatarEmoji,
        category: settings.category,
        difficulty: settings.difficulty,
        playedAt: new Date().toISOString(),
        isVip: subscription.isPremium,
        isDailyChallenge: isDaily,
        dailyChallengeDate: dailyDateKey,
      });

      setLeaderboard(result.entries);
      setPlayerRank(result.rank);
      if (result.dailyRank) {
        setPlayerDailyRank(result.dailyRank);
      }
      if (result.dailyEntries) {
        setDailyLeaderboard(result.dailyEntries);
      }
      setHasSubmitted(true);

      // Trigger particle-based framer-motion confetti for top tier high scores (top 5, top 3 daily, or new record)
      const achievedHighScore =
        result.rank <= 5 ||
        (result.dailyRank !== undefined && result.dailyRank <= 3) ||
        result.isNewHigh;
      setIsHighScore(achievedHighScore);
      if (achievedHighScore) {
        setShowFramerConfetti(true);
      }

      // Also trigger canvas-confetti burst
      try {
        confetti({
          particleCount: result.isNewHigh ? 180 : 120,
          spread: result.isNewHigh ? 100 : 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981', '#00baf2'],
        });
      } catch (e) {}
    }
  }, [
    score,
    accuracy,
    highestStreak,
    totalCount,
    correctCount,
    host,
    settings,
    subscription,
    hasSubmitted,
    isDaily,
    dailyDateKey,
  ]);

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      localStorage.setItem('triviaverse_player_name', playerName.trim());
    } catch (err) {}

    // Resave with custom name
    const result = saveLeaderboardEntry({
      playerName: playerName.trim(),
      score,
      accuracy,
      highestStreak,
      totalQuestions: totalCount,
      correctCount,
      hostName: host.name,
      hostEmoji: host.avatarEmoji,
      category: settings.category,
      difficulty: settings.difficulty,
      playedAt: new Date().toISOString(),
      isVip: subscription.isPremium,
      isDailyChallenge: isDaily,
      dailyChallengeDate: dailyDateKey,
    });

    setLeaderboard(result.entries);
    setPlayerRank(result.rank);
    if (result.dailyRank) setPlayerDailyRank(result.dailyRank);
    if (result.dailyEntries) setDailyLeaderboard(result.dailyEntries);
    setHasSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4 relative">
      {/* Particle-based Framer Motion Confetti on High Score */}
      {showFramerConfetti && (
        <MotionConfetti isTopScore={playerRank === 1 || playerDailyRank === 1} count={playerRank === 1 ? 90 : 65} />
      )}

      {/* Trophy & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-4xl shadow-xl shadow-amber-500/10 mx-auto animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
          {isDaily ? 'DAILY CHALLENGE COMPLETE!' : 'GAME OVER, CHAMPION!'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {isDaily
            ? `Your official score for the "${todayChallenge.info.themeTitle}" daily challenge is verified!`
            : `The spotlights have dimmed, and ${host.name} has recorded your tournament score.`}
        </p>

        {/* Rank Banners */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {isDaily && playerDailyRank && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border border-amber-400 text-amber-200 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 animate-pulse">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>
                Today’s Global Challenge Rank:{' '}
                <strong className="text-white font-mono font-black text-base">#{playerDailyRank}</strong>
                {playerDailyRank === 1 ? ' 🏆 #1 ON TODAY’S LEADERBOARD!' : ' against all players!'}
              </span>
            </div>
          )}

          {playerRank && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 font-bold text-xs shadow-lg">
              <Medal className="w-3.5 h-3.5 text-amber-400" />
              <span>
                All-Time Rank:{' '}
                <strong className="text-white font-mono font-black">#{playerRank}</strong>
                {playerRank === 1 ? ' 🏆 ALL-TIME RECORD!' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Host Final Assessment Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-4xl shrink-0">
            {host.avatarEmoji}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-100 font-['Cabinet_Grotesk']">
                {host.name}&apos;s Final Verdict
              </span>
              <span className="text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash TTS
              </span>
              {isDaily && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Challenge of the Day
                </span>
              )}
              {subscription.isPremium && (
                <span className="text-[10px] text-[#00baf2] bg-[#00baf2]/20 border border-[#00baf2]/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" /> VIP Bonus Applied
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
              &ldquo;{hostFinalCommentary || 'What a spectacular round of trivia! You held your ground against the board!'}&rdquo;
            </p>
          </div>
          <button
            onClick={onReplayCommentary}
            disabled={isSpeaking}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-50 shrink-0"
            title="Listen to host verdict again"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Final Score
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Correct Answers
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {correctCount}/{totalCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Accuracy Rate
          </span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
            {accuracy}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Streak
          </span>
          <span className="text-2xl sm:text-3xl font-black text-orange-400 font-mono flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {highestStreak}x
          </span>
        </div>
      </div>

      {/* Social Media Sharing Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-white font-['Cabinet_Grotesk']">
              Share Your Score & Challenge Friends
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Broadcast your {score.toLocaleString()} pts & {highestStreak}x streak record to Twitter (X), WhatsApp, or copy your game badge.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
          {/* Twitter / X Share Button */}
          <button
            onClick={handleShareTwitter}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-sky-400/60 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md group"
            title="Share your trivia score on Twitter (X)"
          >
            <span className="font-mono text-sm leading-none group-hover:text-sky-400">𝕏</span>
            <span>Post on X</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            title="Share score on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Snippet Button */}
          <button
            onClick={handleCopyShare}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/50 text-indigo-200 hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            title="Copy shareable scorecard to clipboard"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Badge</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Player Tag Customizer Form */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <UserCheck className="w-4 h-4 text-[#00baf2]" />
          <span>
            Leaderboard Display Name:{' '}
            <strong className="text-white font-mono">{playerName}</strong>
          </span>
        </div>

        <form onSubmit={handleUpdateName} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            maxLength={18}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1 sm:w-44 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00baf2]"
            placeholder="Change player tag..."
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#00baf2] hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow transition-colors"
          >
            Update Tag
          </button>
        </form>
      </div>

      {/* Navigation Tabs: Daily Leaderboard vs All-Time vs Question Review */}
      <div className="flex border-b border-slate-800 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${
            activeTab === 'daily'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4 text-amber-400" />
          <span>Today’s Challenge Rank</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            {todayChallenge.info.themeTitle}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${
            activeTab === 'leaderboard'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-indigo-400" />
          <span>All-Time High Scores</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            Top 25
          </span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative shrink-0 ${
            activeTab === 'review'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4 text-sky-400" />
          <span>Question Review & Sources ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY CHALLENGE GLOBAL LEADERBOARD */}
      {activeTab === 'daily' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-200">
                {todayChallenge.info.dayName} &bull; {todayChallenge.info.themeTitle}
              </span>
            </div>
            <span className="text-slate-400 font-mono">
              Date: {dailyDateKey} &bull; Fixed 5 Questions
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 text-center w-12">Rank</th>
                  <th className="py-3 px-4">Contestant</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Accuracy / Streak</th>
                  <th className="py-3 px-4 hidden md:table-cell">Host Persona</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {dailyLeaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentScore =
                    hasSubmitted &&
                    entry.score === score &&
                    entry.playerName === playerName;

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-colors ${
                        isCurrentScore
                          ? 'bg-amber-500/15 text-white font-bold ring-1 ring-inset ring-amber-500/50'
                          : rank <= 3
                          ? 'bg-slate-900/60 hover:bg-slate-800/50'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs shadow-md">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold text-xs">{rank}</span>
                        )}
                      </td>

                      {/* Contestant */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-100 text-sm">
                            {entry.playerName}
                          </span>
                          {entry.isVip && (
                            <span className="text-[10px] text-[#00baf2] bg-[#00baf2]/20 border border-[#00baf2]/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                          {isCurrentScore && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        <span className="text-amber-400 font-black text-base font-mono">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">pts</span>
                      </td>

                      {/* Accuracy & Streak */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{entry.accuracy}%</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-orange-400 font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            {entry.highestStreak}x streak
                          </span>
                        </div>
                      </td>

                      {/* Host */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs font-sans">
                        <div className="text-slate-300 flex items-center gap-1.5">
                          <span>{entry.hostEmoji}</span>
                          <span className="font-medium">{entry.hostName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right text-xs font-sans">
                        {isCurrentScore ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                            Verified
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Globe2 className="w-3 h-3 text-amber-400" />
            All players tackle the exact same 5 questions today. Category resets every midnight!
          </p>
        </div>
      )}

      {/* TAB 2: ALL-TIME TOP SCORES LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Contestant</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Accuracy / Streak</th>
                  <th className="py-3 px-4 hidden md:table-cell">Host & Category</th>
                  <th className="py-3 px-4 text-right hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentScore =
                    hasSubmitted &&
                    entry.score === score &&
                    entry.playerName === playerName;

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-colors ${
                        isCurrentScore
                          ? 'bg-amber-500/15 text-white font-bold ring-1 ring-inset ring-amber-500/50'
                          : rank <= 3
                          ? 'bg-slate-900/60 hover:bg-slate-800/50'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs shadow-md">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold text-xs">{rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-100 text-sm">
                            {entry.playerName}
                          </span>
                          {entry.isVip && (
                            <span className="text-[10px] text-[#00baf2] bg-[#00baf2]/20 border border-[#00baf2]/30 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                          {isCurrentScore && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase">
                              Just Now
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-amber-400 font-black text-base font-mono">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-sans">pts</span>
                      </td>

                      <td className="py-3.5 px-4 hidden sm:table-cell text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{entry.accuracy}%</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-orange-400 font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            {entry.highestStreak}x streak
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell text-xs font-sans">
                        <div className="text-slate-300 flex items-center gap-1.5">
                          <span>{entry.hostEmoji}</span>
                          <span className="font-medium">{entry.hostName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {entry.category} &bull; {entry.difficulty}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right hidden lg:table-cell text-[11px] text-slate-500 font-sans">
                        {new Date(entry.playedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Trophy className="w-3 h-3 text-amber-400" />
            Top 25 scores persistently stored in browser local storage across sessions.
          </p>
        </div>
      )}

      {/* TAB 3: QUESTION REVIEW & GROUNDED SOURCES */}
      {activeTab === 'review' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {history.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                item.isCorrect
                  ? 'bg-slate-900/60 border-emerald-900/40'
                  : 'bg-slate-900/60 border-rose-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">
                      {idx + 1}. {item.question.question}
                    </h4>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="text-slate-400">
                        Your answer:{' '}
                        <strong
                          className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {item.userAnswerIndex !== null
                            ? item.question.options[item.userAnswerIndex]
                            : 'Timed Out'}
                        </strong>
                      </span>
                      {!item.isCorrect && (
                        <span className="text-slate-400">
                          Correct:{' '}
                          <strong className="text-emerald-400">
                            {item.question.options[item.question.correctAnswerIndex]}
                          </strong>
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {item.question.explanation}
                    </p>

                    {/* Grounding web sources */}
                    {item.question.groundingSources && item.question.groundingSources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Search className="w-3 h-3 text-blue-400" />
                          Sources:
                        </span>
                        {item.question.groundingSources.map((s, sIdx) => (
                          <a
                            key={sIdx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                  +{item.pointsEarned} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isDaily ? 'Replay Daily Challenge' : `Play Again with ${host.name}`}</span>
        </button>

        <button
          onClick={onChangeHost}
          className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
        >
          <span>Return to Game Lobby</span>
        </button>
      </div>
    </div>
  );
};
