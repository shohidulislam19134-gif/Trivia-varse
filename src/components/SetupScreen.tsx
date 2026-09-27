import React, { useState } from 'react';
import { HostPersonality, GameSettings, VoiceName, UserSubscription } from '../types';
import { PRESET_HOSTS, CATEGORIES } from '../data/hosts';
import { getTodaysChallenge } from '../data/dailyChallenge';
import {
  Sparkles,
  Volume2,
  Play,
  Wand2,
  Search,
  Check,
  Zap,
  Crown,
  Lock,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  Trophy,
  Calendar,
  Globe2,
  ArrowRight,
} from 'lucide-react';

interface SetupScreenProps {
  settings: GameSettings;
  subscription: UserSubscription;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onStartDailyChallenge: () => void;
  isLoadingQuestions: boolean;
  onPreviewVoice: (host: HostPersonality) => void;
  isPlayingPreview: boolean;
  onOpenUpgradeModal: (preselectedTierId?: string) => void;
  onOpenLeaderboard?: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  settings,
  subscription,
  onUpdateSettings,
  onStartGame,
  onStartDailyChallenge,
  isLoadingQuestions,
  onPreviewVoice,
  isPlayingPreview,
  onOpenUpgradeModal,
  onOpenLeaderboard,
}) => {
  const [showCustomHostModal, setShowCustomHostModal] = useState(false);
  const [customHostForm, setCustomHostForm] = useState<{
    name: string;
    title: string;
    description: string;
    voiceName: VoiceName;
    systemPrompt: string;
    sampleCatchphrase: string;
    avatarEmoji: string;
  }>({
    name: 'Captain Cosmos',
    title: 'Intergalactic Explorer',
    description: 'An enthusiastic cosmic voyager searching the galaxy for trivia prodigies.',
    voiceName: 'Puck',
    systemPrompt: 'You are Captain Cosmos, a boisterous space explorer hosting a galactic trivia contest. You use cosmic terminology (light years, asteroids, warp speed). Keep it high-energy and fun.',
    sampleCatchphrase: 'Engage warp drive, cadets! Let us see if your mind can traverse the cosmos!',
    avatarEmoji: '🚀👨‍🚀',
  });

  // Load today's challenge info
  const todaysChallenge = getTodaysChallenge();

  const availableVoices: Array<{ name: VoiceName; desc: string }> = [
    { name: 'Puck', desc: 'Energetic, expressive, theatrical male tone' },
    { name: 'Charon', desc: 'Deep, authoritative, cultured British baritone' },
    { name: 'Kore', desc: 'Warm, empathetic, cheerful feminine tone' },
    { name: 'Fenrir', desc: 'Deep, resonant, dramatic robotic or gravelly tone' },
    { name: 'Zephyr', desc: 'Brisk, youthful, crisp and hyped voice' },
  ];

  const handleSaveCustomHost = () => {
    const newHost: HostPersonality = {
      id: `custom_${Date.now()}`,
      name: customHostForm.name || 'Custom Host',
      title: customHostForm.title || 'Special Guest Host',
      tagline: customHostForm.description || 'Custom crafted host',
      description: customHostForm.description || 'Custom host persona',
      voiceName: customHostForm.voiceName,
      speechStyle: `Personality: ${customHostForm.description}. Catchphrase style: ${customHostForm.sampleCatchphrase}`,
      avatarEmoji: customHostForm.avatarEmoji || '🎭',
      themeColor: 'cyan',
      glowColor: '#06b6d4',
      systemPrompt: customHostForm.systemPrompt,
      sampleCatchphrase: customHostForm.sampleCatchphrase,
    };

    onUpdateSettings({ host: newHost, isDailyChallenge: false });
    setShowCustomHostModal(false);
  };

  const handleHostClick = (h: HostPersonality) => {
    if (h.isVip && !subscription.isPremium) {
      onOpenUpgradeModal('pass_vip');
      return;
    }
    onUpdateSettings({ host: h });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      {/* Hero Welcome Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Interactive AI Trivia Arena</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
          CHOOSE YOUR HOST. ENTER THE ARENA.
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Select your dynamic AI Host with custom voice personas, banter with them using real-time voice,
          and tackle questions grounded by live Google Search data.
        </p>

        {onOpenLeaderboard && (
          <div className="pt-1 flex justify-center">
            <button
              onClick={onOpenLeaderboard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-amber-400 text-xs font-bold transition-all shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Hall of Fame Top Scores</span>
            </button>
          </div>
        )}
      </div>

      {/* FEATURED: DAILY-CHANGING 'CHALLENGE OF THE DAY' BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 p-5 sm:p-6 shadow-2xl shadow-amber-500/10">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                <Calendar className="w-3.5 h-3.5 fill-current" />
                Challenge of the Day
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                {todaysChallenge.info.dateKey}
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> Global Leaderboard Active
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                <span>{todaysChallenge.info.categoryIcon}</span>
                <span>{todaysChallenge.info.themeTitle}</span>
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                {todaysChallenge.info.description} All global contenders face the <strong>exact same fixed 5 questions</strong> today. Can you claim the #1 rank on today&apos;s leaderboard?
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Category: <strong className="text-slate-200">{todaysChallenge.info.categoryName}</strong></span>
              <span>&bull;</span>
              <span>Difficulty: <strong className="text-amber-400 uppercase">{todaysChallenge.info.difficulty}</strong></span>
              <span>&bull;</span>
              <span>Questions: <strong className="text-slate-200">5 Handcrafted &amp; Grounded</strong></span>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onStartDailyChallenge}
              disabled={isLoadingQuestions}
              className="w-full lg:w-56 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoadingQuestions ? 'Preparing Arena...' : 'Play Daily Challenge'}</span>
            </button>
            <span className="text-[11px] text-center text-slate-400">
              Resets every midnight with a fresh category
            </span>
          </div>
        </div>
      </div>

      {/* Paytm VIP Pass Promotion Banner */}
      {!subscription.isPremium && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002970] via-sky-950 to-slate-900 border border-[#00baf2]/40 p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#00baf2]/20 border border-[#00baf2]/40 flex items-center justify-center text-amber-300 text-2xl shrink-0 shadow-lg shadow-[#00baf2]/20">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#00baf2] bg-[#00baf2]/20 px-2 py-0.5 rounded-full border border-[#00baf2]/30">
                  Paytm VIP Access Available
                </span>
                <span className="text-xs text-amber-400 font-bold">Only ₹199</span>
              </div>
              <h3 className="font-extrabold text-white text-sm sm:text-base font-['Cabinet_Grotesk'] mt-0.5">
                Unlock VIP Celebrity AI Hosts & Unlimited Lifelines
              </h3>
              <p className="text-xs text-slate-300">
                Unlock Lady Seraphina & Maestro Leonardo, 15-question championship rounds, and zero lifeline limits.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenUpgradeModal('pass_vip')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00baf2] to-sky-400 hover:from-sky-300 hover:to-sky-500 text-slate-950 font-black text-xs shadow-lg shadow-[#00baf2]/25 shrink-0 transition-all flex items-center justify-center gap-1.5"
          >
            <Crown className="w-4 h-4 fill-current text-slate-950" />
            <span>Get VIP Pass with Paytm</span>
          </button>
        </div>
      )}

      {/* STEP 1: CHOOSE AI HOST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Cabinet_Grotesk']">
              Select Your AI Host
            </h2>
          </div>

          <button
            onClick={() => setShowCustomHostModal(true)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Custom Host</span>
          </button>
        </div>

        {/* Host Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_HOSTS.map((host) => {
            const isSelected = settings.host.id === host.id;
            const isLocked = host.isVip && !subscription.isPremium;

            return (
              <div
                key={host.id}
                onClick={() => handleHostClick(host)}
                className={`relative group cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40'
                    : isLocked
                    ? 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800/90 hover:border-amber-500/50'
                    : 'bg-slate-900/70 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-3xl shadow-md">
                        {host.avatarEmoji}
                        {host.isVip && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
                            👑
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-100 font-['Cabinet_Grotesk'] text-base">
                            {host.name}
                          </h3>
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium">
                          {host.title}
                        </p>
                      </div>
                    </div>

                    {isLocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        VIP
                      </span>
                    ) : isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {host.description}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 italic">
                    &ldquo;{host.sampleCatchphrase}&rdquo;
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Voice: {host.voiceName} (Gemini TTS)
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewVoice(host);
                    }}
                    disabled={isPlayingPreview}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                    title={`Hear sample voice of ${host.name}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: CATEGORY SELECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
            2
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white font-['Cabinet_Grotesk']">
            Select Category or Custom Topic
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = settings.category === cat.id && !settings.isDailyChallenge;
            return (
              <button
                key={cat.id}
                onClick={() => onUpdateSettings({ category: cat.id, isDailyChallenge: false })}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-slate-100">
                    {cat.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom Topic Input if 'custom' is selected */}
        {settings.category === 'custom' && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/60 space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Enter Any Custom Topic for Google Search Grounding:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.customTopic || ''}
                onChange={(e) => onUpdateSettings({ customTopic: e.target.value })}
                placeholder="e.g. 2026 World Cup Qualifiers, James Webb Discoveries, Anime Awards, Dune lore..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              Gemini 3.5 Flash will search Google in real time to generate accurate questions for this specific topic!
            </p>
          </div>
        )}
      </div>

      {/* STEP 3: GAME CONFIGURATION & SEARCH GROUNDING */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
            3
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white font-['Cabinet_Grotesk']">
            Game Mode & Features
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Difficulty
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => onUpdateSettings({ difficulty: diff })}
                  className={`py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                    settings.difficulty === diff
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Question Count
              </span>
              {!subscription.isPremium && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> 15Q in VIP
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[5, 10, 15].map((cnt) => {
                const isLocked = cnt === 15 && !subscription.isPremium;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        onOpenUpgradeModal('pass_vip');
                      } else {
                        onUpdateSettings({ questionCount: cnt });
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                      settings.questionCount === cnt
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : isLocked
                        ? 'bg-slate-950/60 border border-slate-800/80 text-slate-500 hover:border-amber-500/40'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{cnt} Qs</span>
                    {isLocked && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Search Grounding Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Search Grounding
                </span>
              </div>
              <input
                type="checkbox"
                id="searchGrounding"
                checked={settings.useSearchGrounding}
                onChange={(e) => onUpdateSettings({ useSearchGrounding: e.target.checked })}
                className="w-4 h-4 rounded text-blue-500 bg-slate-950 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Verify questions with real-time web citations and news using Google Search Grounding.
            </p>
          </div>
        </div>
      </div>

      {/* START GAME ACTION BAR */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Selected Host:</span>
          <span className="text-slate-200 font-bold flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span>{settings.host.avatarEmoji}</span>
            <span>{settings.host.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onStartDailyChallenge}
            disabled={isLoadingQuestions}
            className="flex-1 sm:flex-initial py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Challenge</span>
          </button>

          <button
            onClick={onStartGame}
            disabled={isLoadingQuestions}
            className="flex-1 sm:flex-initial py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoadingQuestions ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Host Crafting Questions...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Standard Trivia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CUSTOM HOST MODAL */}
      {showCustomHostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                Create Custom AI Host Persona
              </h3>
              <button
                onClick={() => setShowCustomHostModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Host Name</label>
                <input
                  type="text"
                  value={customHostForm.name}
                  onChange={(e) => setCustomHostForm({ ...customHostForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Victor Vortex"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Title & Persona Tag</label>
                <input
                  type="text"
                  value={customHostForm.title}
                  onChange={(e) => setCustomHostForm({ ...customHostForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Master of Mysteries"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Emoji Avatar</label>
                <input
                  type="text"
                  value={customHostForm.avatarEmoji}
                  onChange={(e) => setCustomHostForm({ ...customHostForm, avatarEmoji: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="e.g. 🧙‍♂️✨"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Gemini TTS Voice Model
                </label>
                <select
                  value={customHostForm.voiceName}
                  onChange={(e) =>
                    setCustomHostForm({ ...customHostForm, voiceName: e.target.value as VoiceName })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} &mdash; {v.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Signature Catchphrase</label>
                <input
                  type="text"
                  value={customHostForm.sampleCatchphrase}
                  onChange={(e) =>
                    setCustomHostForm({ ...customHostForm, sampleCatchphrase: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Fasten your mental seatbelts!"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  System Persona Prompt (How they react & banter)
                </label>
                <textarea
                  rows={3}
                  value={customHostForm.systemPrompt}
                  onChange={(e) =>
                    setCustomHostForm({ ...customHostForm, systemPrompt: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Describe how the host behaves, speaks, roasts or praises contestants..."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCustomHostModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomHost}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
              >
                Deploy Custom Host
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
