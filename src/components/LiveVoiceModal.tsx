import React, { useState } from 'react';
import { HostPersonality } from '../types';
import { Mic, MicOff, X, Radio, Sparkles, Volume2, AlertCircle, RefreshCw } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: HostPersonality;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  isHostSpeaking: boolean;
  isMicMuted: boolean;
  isMicAvailable?: boolean;
  userAudioLevel: number;
  onToggleMute: () => void;
  onStartLive: () => void;
  onStopLive: () => void;
  onSendTextPrompt: (text: string) => void;
  transcriptions: Array<{ text: string; role: 'user' | 'model'; time: string }>;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  host,
  status,
  errorMessage,
  isHostSpeaking,
  isMicMuted,
  isMicAvailable = true,
  userAudioLevel,
  onToggleMute,
  onStartLive,
  onStopLive,
  onSendTextPrompt,
  transcriptions,
}) => {
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Can you give me a cryptic hint without spoiling the answer?',
    'Why is this trivia fact significant?',
    'Roast my trivia guessing skills!',
    'Tell a quick game show joke!',
  ];

  const handleSendPrompt = (prompt: string) => {
    onSendTextPrompt(prompt);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSendTextPrompt(customInput);
    setCustomInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              {host.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  Gemini 3.8 Live Voice Studio
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Live API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Talking directly with <strong className="text-slate-300">{host.name}</strong> in real-time
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onStopLive();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer Stage */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle animated background glow */}
          <div
            className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 ${
              isHostSpeaking
                ? 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5),transparent_70%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent_70%)]'
            }`}
          />

          {/* Central Avatar Visualizer */}
          <div className="relative flex flex-col items-center z-10">
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-300 shadow-xl ${
                isHostSpeaking
                  ? 'scale-110 ring-4 ring-amber-400/80 shadow-amber-500/30 bg-gradient-to-b from-amber-600/30 to-slate-900'
                  : status === 'connected'
                  ? 'ring-2 ring-emerald-500/40 bg-slate-800'
                  : 'bg-slate-800'
              }`}
            >
              <span>{host.avatarEmoji}</span>

              {/* Host Waveform Waves */}
              {isHostSpeaking && (
                <div className="absolute -inset-3 rounded-full border border-amber-400/40 animate-ping pointer-events-none" />
              )}
            </div>

            {/* Speaking State Badge */}
            <div className="mt-3 flex items-center gap-2">
              {status === 'connected' ? (
                isHostSpeaking ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    {host.name} is speaking...
                  </span>
                ) : !isMicAvailable ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Ready (Type your message below)
                  </span>
                ) : isMicMuted ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                    <MicOff className="w-3.5 h-3.5" />
                    Microphone Muted
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 animate-pulse" />
                    Listening to you (Speak now)
                  </span>
                )
              ) : status === 'connecting' ? (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Connecting to Gemini 3.8 Live session...
                </span>
              ) : status === 'error' ? (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Connection Error
                </span>
              ) : (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                  Live Voice Inactive
                </span>
              )}
            </div>

            {/* Live User Mic Level Meter */}
            {status === 'connected' && !isMicMuted && (
              <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2.5 overflow-hidden flex items-center p-0.5">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, Math.max(5, userAudioLevel * 100))}%` }}
                />
              </div>
            )}
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="mt-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs text-center max-w-md">
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            {status === 'idle' || status === 'error' ? (
              <button
                onClick={onStartLive}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                <Mic className="w-4 h-4" />
                Start Live Audio Conversation
              </button>
            ) : (
              <>
                <button
                  onClick={onToggleMute}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMicMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>

                <button
                  onClick={onStopLive}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-600/40 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold transition-all"
                >
                  End Voice Session
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Banter Prompts */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Talk Suggestions (or just speak freely)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                disabled={status !== 'connected'}
                onClick={() => handleSendPrompt(prompt)}
                className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Live Conversation Transcription Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[140px] max-h-[220px]">
          {transcriptions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs py-6">
              <p>Speak naturally into your microphone or pick a prompt.</p>
              <p className="text-slate-600 mt-1">
                Powered by Google Gemini 3.8 Live API with sub-second voice latency.
              </p>
            </div>
          ) : (
            transcriptions.map((t, i) => (
              <div
                key={i}
                className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    t.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="font-semibold text-[10px] text-slate-300 mb-0.5">
                    {t.role === 'user' ? 'You' : host.name}
                  </p>
                  <p>{t.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Text Input Fallback if microphone cannot be used */}
        <form onSubmit={handleCustomSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={status !== 'connected'}
            placeholder={status === 'connected' ? 'Type or speak to the host...' : 'Start live session first'}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={status !== 'connected' || !customInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
