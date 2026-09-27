import React from 'react';
import { HostPersonality } from '../types';
import { Volume2, Mic, Sparkles } from 'lucide-react';

interface HostAvatarProps {
  host: HostPersonality;
  isSpeaking: boolean;
  isLiveActive?: boolean;
  speechBubbleText?: string | null;
  mood?: 'excited' | 'dramatic' | 'smug' | 'encouraging' | 'roasting' | 'neutral';
  onReplaySpeech?: () => void;
  onOpenLiveVoice?: () => void;
}

export const HostAvatar: React.FC<HostAvatarProps> = ({
  host,
  isSpeaking,
  isLiveActive = false,
  speechBubbleText,
  mood = 'neutral',
  onReplaySpeech,
  onOpenLiveVoice,
}) => {
  // Theme color accents
  const colorMap: Record<string, { ring: string; bg: string; badge: string; border: string }> = {
    amber: {
      ring: 'ring-amber-500/50 border-amber-500/40 shadow-amber-500/20',
      bg: 'from-amber-950/60 to-slate-900',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/30',
    },
    purple: {
      ring: 'ring-purple-500/50 border-purple-500/40 shadow-purple-500/20',
      bg: 'from-purple-950/60 to-slate-900',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      border: 'border-purple-500/30',
    },
    cyan: {
      ring: 'ring-cyan-500/50 border-cyan-500/40 shadow-cyan-500/20',
      bg: 'from-cyan-950/60 to-slate-900',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      border: 'border-cyan-500/30',
    },
    emerald: {
      ring: 'ring-emerald-500/50 border-emerald-500/40 shadow-emerald-500/20',
      bg: 'from-emerald-950/60 to-slate-900',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      border: 'border-emerald-500/30',
    },
    rose: {
      ring: 'ring-rose-500/50 border-rose-500/40 shadow-rose-500/20',
      bg: 'from-rose-950/60 to-slate-900',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      border: 'border-rose-500/30',
    },
  };

  const currentTheme = colorMap[host.themeColor] || colorMap.amber;

  return (
    <div className="relative flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl">
      {/* Avatar Container */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-4xl md:text-5xl select-none transition-all duration-300 shadow-lg ${
            isSpeaking
              ? `ring-4 scale-105 ${currentTheme.ring}`
              : 'border border-slate-700/80 hover:border-slate-600'
          } bg-gradient-to-b ${currentTheme.bg}`}
        >
          {/* Avatar Emoji */}
          <span className={`transform transition-transform ${isSpeaking ? 'animate-bounce' : ''}`}>
            {host.avatarEmoji}
          </span>

          {/* Speaking Audio Waveform Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-slate-950/90 px-2 py-0.5 rounded-full border border-slate-700 shadow">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-amber-300 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-3.5 bg-amber-200 rounded-full animate-pulse [animation-delay:75ms]" />
            </div>
          )}

          {/* Live Indicator Badge */}
          {isLiveActive && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          )}
        </div>

        {/* Live Audio Banter trigger button */}
        {onOpenLiveVoice && (
          <button
            onClick={onOpenLiveVoice}
            className={`mt-2 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border transition-all ${
              isLiveActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/30'
            }`}
            title="Real-time two-way voice chat with Gemini Live"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isLiveActive ? 'Live Voice On' : 'Talk to Host'}</span>
          </button>
        )}
      </div>

      {/* Host Details & Speech Bubble */}
      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-1.5 font-['Cabinet_Grotesk']">
            {host.name}
          </h3>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${currentTheme.badge}`}>
            {host.title}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
            Voice: {host.voiceName} (Gemini 3.8 Flash TTS)
          </span>
        </div>

        {/* Speech Bubble / Host Commentary */}
        <div className="relative mt-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed shadow-inner">
          <div className="flex items-start justify-between gap-2">
            <p className="italic">
              &ldquo;{speechBubbleText || host.sampleCatchphrase}&rdquo;
            </p>
            {onReplaySpeech && speechBubbleText && (
              <button
                onClick={onReplaySpeech}
                disabled={isSpeaking}
                className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors disabled:opacity-50"
                title="Listen to host voice"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
