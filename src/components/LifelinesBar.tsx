import React from 'react';
import { Sparkles, MessageCircleQuestion, HelpCircle, Split, Clock, Flame, Crown, Infinity } from 'lucide-react';

interface LifelinesBarProps {
  score: number;
  streak: number;
  timeRemaining: number;
  totalTime: number;
  lifelines: {
    fiftyFifty: boolean;
    hostHint: boolean;
    searchRadar: boolean;
  };
  isRevealed: boolean;
  isPremium?: boolean;
  onUseFiftyFifty: () => void;
  onUseHostHint: () => void;
  onUseSearchRadar: () => void;
  onOpenUpgradeModal?: () => void;
}

export const LifelinesBar: React.FC<LifelinesBarProps> = ({
  score,
  streak,
  timeRemaining,
  totalTime,
  lifelines,
  isRevealed,
  isPremium = false,
  onUseFiftyFifty,
  onUseHostHint,
  onUseSearchRadar,
  onOpenUpgradeModal,
}) => {
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Score & Streak Counters */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
            ★
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Score
            </span>
            <span className="text-lg font-black text-white font-mono">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Streak Counter with fire glow */}
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
              streak > 1
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse shadow-lg shadow-orange-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Streak
            </span>
            <span className="text-lg font-black text-white font-mono">
              {streak}x
            </span>
          </div>
        </div>

        {/* VIP Status pill */}
        {isPremium && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#00baf2]/20 border border-[#00baf2]/40 text-[#00baf2] text-[11px] font-black">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP UNLIMITED</span>
          </div>
        )}
      </div>

      {/* Countdown Timer with Visual Progress Bar */}
      <div className="flex items-center gap-2.5 w-full sm:w-48 order-last sm:order-none">
        <Clock
          className={`w-4 h-4 shrink-0 ${
            timeRemaining <= 5 && !isRevealed
              ? 'text-rose-400 animate-spin'
              : 'text-slate-400'
          }`}
        />
        <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              timeRemaining <= 5
                ? 'bg-rose-500'
                : timeRemaining <= 10
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
        <span
          className={`font-mono text-xs font-black shrink-0 ${
            timeRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-300'
          }`}
        >
          {timeRemaining}s
        </span>
      </div>

      {/* Lifeline Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
        {/* 50:50 Lifeline */}
        <button
          onClick={onUseFiftyFifty}
          disabled={(!isPremium && !lifelines.fiftyFifty) || isRevealed}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            (isPremium || lifelines.fiftyFifty) && !isRevealed
              ? 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40 hover:scale-105 active:scale-95'
              : 'bg-slate-950/40 text-slate-600 border-slate-800 line-through opacity-50 cursor-not-allowed'
          }`}
          title={isPremium ? 'Unlimited 50:50 with VIP Pass' : 'Eliminate two incorrect options'}
        >
          <Split className="w-3.5 h-3.5" />
          <span>50:50</span>
          {isPremium && <span className="text-[10px] text-[#00baf2]">∞</span>}
        </button>

        {/* Ask Host / Whisper Lifeline */}
        <button
          onClick={onUseHostHint}
          disabled={(!isPremium && !lifelines.hostHint) || isRevealed}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            (isPremium || lifelines.hostHint) && !isRevealed
              ? 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border-purple-500/40 hover:scale-105 active:scale-95'
              : 'bg-slate-950/40 text-slate-600 border-slate-800 line-through opacity-50 cursor-not-allowed'
          }`}
          title={isPremium ? 'Unlimited Host Whispers with VIP Pass' : 'Ask the AI Host for a witty, subtle hint'}
        >
          <MessageCircleQuestion className="w-3.5 h-3.5" />
          <span>Host Hint</span>
          {isPremium && <span className="text-[10px] text-[#00baf2]">∞</span>}
        </button>

        {/* Google Search Radar Lifeline */}
        <button
          onClick={onUseSearchRadar}
          disabled={(!isPremium && !lifelines.searchRadar) || isRevealed}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            (isPremium || lifelines.searchRadar) && !isRevealed
              ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border-emerald-500/40 hover:scale-105 active:scale-95'
              : 'bg-slate-950/40 text-slate-600 border-slate-800 line-through opacity-50 cursor-not-allowed'
          }`}
          title={isPremium ? 'Unlimited Google Radar with VIP Pass' : 'Use Google Search Grounding to reveal web clue'}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Web Radar</span>
          {isPremium && <span className="text-[10px] text-[#00baf2]">∞</span>}
        </button>
      </div>
    </div>
  );
};
