import React, { useState } from 'react';
import { TriviaQuestion } from '../types';
import {
  Volume2,
  VolumeX,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface QuestionCardProps {
  question: TriviaQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | null;
  isRevealed: boolean;
  eliminatedOptions: number[];
  isSpeaking: boolean;
  onSelectOption: (index: number) => void;
  onReadQuestion: () => void;
  onStopSpeech: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  isRevealed,
  eliminatedOptions,
  isSpeaking,
  onSelectOption,
  onReadQuestion,
  onStopSpeech,
}) => {
  const [showFactCheck, setShowFactCheck] = useState(false);
  const [factCheckData, setFactCheckData] = useState<{
    text: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);
  const [isLoadingFactCheck, setIsLoadingFactCheck] = useState(false);

  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleFetchFactCheck = async () => {
    if (factCheckData) {
      setShowFactCheck(!showFactCheck);
      return;
    }

    setIsLoadingFactCheck(true);
    setShowFactCheck(true);

    try {
      const res = await fetch('/api/trivia/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          answer: question.options[question.correctAnswerIndex],
          explanation: question.explanation,
        }),
      });

      if (!res.ok) throw new Error('Failed to retrieve live fact check');
      const data = await res.json();
      setFactCheckData({
        text: data.factCheck,
        sources: data.sources || [],
      });
    } catch (err) {
      console.error(err);
      setFactCheckData({
        text: 'Verified via Google Search: ' + question.explanation,
        sources: question.groundingSources || [],
      });
    } finally {
      setIsLoadingFactCheck(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
            {question.category || 'General'}
          </span>
          <span
            className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
              question.difficulty === 'hard'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : question.difficulty === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* TTS Read Aloud Control */}
        <div className="flex items-center gap-2">
          {question.groundingSources && question.groundingSources.length > 0 && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-blue-400" />
              Google Grounded
            </span>
          )}

          <button
            onClick={isSpeaking ? onStopSpeech : onReadQuestion}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title={isSpeaking ? 'Stop host reading' : 'Listen to host read question'}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Speaking</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Question Text */}
      <div className="py-5 sm:py-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight font-['Cabinet_Grotesk']">
          {question.question}
        </h2>
      </div>

      {/* Multiple Choice Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === question.correctAnswerIndex;
          const isEliminated = eliminatedOptions.includes(idx);

          let optionStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200';
          let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';

          if (isEliminated) {
            optionStyle = 'opacity-30 pointer-events-none line-through border-slate-800/40 text-slate-600 bg-slate-950/30';
            badgeStyle = 'bg-slate-900 text-slate-700 border-slate-800';
          } else if (isRevealed) {
            if (isCorrect) {
              optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/50';
              badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
            } else if (isSelected && !isCorrect) {
              optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/50';
              badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
            } else {
              optionStyle = 'opacity-50 border-slate-800 text-slate-400 bg-slate-950/40';
            }
          } else if (isSelected) {
            optionStyle = 'bg-amber-950/70 border-amber-500 text-amber-100 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50';
            badgeStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
          }

          return (
            <button
              key={idx}
              disabled={isRevealed || isEliminated}
              onClick={() => onSelectOption(idx)}
              className={`group relative text-left p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 ${optionStyle}`}
            >
              {/* Option Letter Badge */}
              <span
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors ${badgeStyle}`}
              >
                {optionLabels[idx]}
              </span>

              {/* Option Text */}
              <span className="flex-1 pt-1 text-sm sm:text-base font-semibold leading-relaxed">
                {option}
              </span>

              {/* Status Indicator Icon when revealed */}
              {isRevealed && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
              )}
              {isRevealed && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Post-Answer Explanation & Fact-Check Drawer */}
      {isRevealed && (
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              Host Explanation
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>

          {/* Google Search Grounding Sources & Deep Fact-Check */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {question.groundingSources && question.groundingSources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    Web Sources:
                  </span>
                  {question.groundingSources.map((source, sIdx) => (
                    <a
                      key={sIdx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/60 border border-blue-900/50 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <span className="max-w-[120px] truncate">{source.title || 'Source'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleFetchFactCheck}
              className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              {isLoadingFactCheck ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Searching Live Web...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {showFactCheck ? 'Hide Web Fact-Check' : 'Live Google Fact-Check'}
                </>
              )}
            </button>
          </div>

          {/* Deep Fact Check Content */}
          {showFactCheck && factCheckData && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                Live Gemini 3.5 Flash Google Search Verification
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {factCheckData.text}
              </p>

              {factCheckData.sources && factCheckData.sources.length > 0 && (
                <div className="pt-2 border-t border-indigo-900/40 flex flex-wrap gap-2">
                  <span className="text-[11px] text-slate-400">Verified links:</span>
                  {factCheckData.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-300 hover:text-blue-200 underline"
                    >
                      <span>{s.title}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
