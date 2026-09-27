import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HostPersonality,
  GameSettings,
  TriviaQuestion,
  GameHistoryItem,
  UserSubscription,
} from './types';
import { PRESET_HOSTS } from './data/hosts';
import { getTodaysChallenge } from './data/dailyChallenge';
import { HostAvatar } from './components/HostAvatar';
import { QuestionCard } from './components/QuestionCard';
import { LifelinesBar } from './components/LifelinesBar';
import { SetupScreen } from './components/SetupScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { PaymentModal } from './components/PaymentModal';
import { SoundFX } from './utils/audioUtils';
import { useHostTts } from './hooks/useHostTts';
import { useGeminiLive } from './hooks/useGeminiLive';
import {
  Mic,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Crown,
  ShieldCheck,
  Trophy,
  Calendar,
  Globe2,
} from 'lucide-react';

const QUESTION_TIME_SECONDS = 20;

export default function App() {
  // Subscription & Paytm VIP Pass State
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('triviaverse_subscription');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isPremium: false,
      tierId: null,
      tierName: null,
      activatedAt: null,
      orderId: null,
      paymentMethod: null,
      txnId: null,
      unlimitedLifelines: false,
      vipHostsUnlocked: false,
      ultraQuestionsUnlocked: false,
    };
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedTierId, setPreselectedTierId] = useState<string>('pass_vip');

  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    category: 'breaking',
    difficulty: 'medium',
    questionCount: 5,
    useSearchGrounding: true,
    autoSpeakQuestions: true,
    enableHostReactions: true,
    host: PRESET_HOSTS[0], // Monty Sterling default
    isDailyChallenge: false,
  });

  // Game Progress State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'game-over'>('setup');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_SECONDS);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  // Lifelines
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    hostHint: true,
    searchRadar: true,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  // Host Dialogue and Commentary state
  const [hostDialogue, setHostDialogue] = useState<string | null>(null);
  const [hostFinalVerdict, setHostFinalVerdict] = useState<string>('');

  // Live Voice Modal State (Gemini 3.8 Live)
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveTranscriptions, setLiveTranscriptions] = useState<
    Array<{ text: string; role: 'user' | 'model'; time: string }>
  >([]);

  // Sound effects mute toggle
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Gemini 3.8 Flash TTS Hook
  const {
    speak,
    stop: stopSpeech,
    isSpeaking,
    isLoading: isLoadingTts,
  } = useHostTts(settings.host);

  // Gemini 3.8 Live API Voice Hook
  const currentQ = questions[currentQuestionIndex];
  const liveGameContext = currentQ
    ? `Question: "${currentQ.question}". Choices: ${currentQ.options.join(
        ', '
      )}. Player score: ${score}, streak: ${streak}. VIP Pass: ${subscription.isPremium ? 'YES' : 'NO'}. Mode: ${settings.isDailyChallenge ? 'Challenge of the Day' : 'Standard'}.`
    : `Player in game setup or summary. Total score: ${score}. VIP: ${subscription.isPremium ? 'YES' : 'NO'}.`;

  const handleTranscription = useCallback(
    (text: string, role: 'user' | 'model') => {
      setLiveTranscriptions((prev) => [
        ...prev.slice(-15),
        {
          text,
          role,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
      ]);
    },
    []
  );

  const liveApi = useGeminiLive({
    host: settings.host,
    gameContext: liveGameContext,
    onTranscription: handleTranscription,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleOpenUpgradeModal = (tierId: string = 'pass_vip') => {
    setPreselectedTierId(tierId);
    setIsPaymentModalOpen(true);
  };

  const handleUpgradeSuccess = (newSub: UserSubscription) => {
    setSubscription(newSub);
    const vipHost = PRESET_HOSTS.find((h) => h.isVip);
    if (vipHost && settings.host.isVip) {
      setSettings((s) => ({ ...s, host: vipHost }));
    }
  };

  // Preview Host Voice in Setup
  const handlePreviewVoice = (hostToPreview: HostPersonality) => {
    const textToSpeak = `${hostToPreview.name} here! ${hostToPreview.sampleCatchphrase}`;
    speak(textToSpeak, hostToPreview.speechStyle);
  };

  // START STANDARD GAME
  const handleStartGame = async () => {
    setIsLoadingQuestions(true);
    setGameError(null);
    stopSpeech();

    try {
      const res = await fetch('/api/trivia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: settings.category,
          customTopic: settings.customTopic,
          difficulty: settings.difficulty,
          questionCount: settings.questionCount,
          useSearchGrounding: settings.useSearchGrounding || settings.category === 'breaking',
          hostName: settings.host.name,
          hostStyle: settings.host.speechStyle,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch questions from server');
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions received from AI host generator');
      }

      if (data.warning) {
        setGameError(data.warning);
      }

      setSettings((s) => ({ ...s, isDailyChallenge: false }));
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setHighestStreak(0);
      setHistory([]);
      setLifelines({ fiftyFifty: true, hostHint: true, searchRadar: true });
      setEliminatedOptions([]);
      setSelectedOption(null);
      setIsRevealed(false);
      setTimeRemaining(QUESTION_TIME_SECONDS);
      setGameState('playing');

      const firstQ = data.questions[0];
      const introText =
        firstQ.hostDialogue ||
        `Welcome to the arena! Let's kick things off with Question 1! ${firstQ.question}`;
      setHostDialogue(introText);

      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(`${introText} ... The question is: ${firstQ.question}`);
      }
    } catch (err: any) {
      console.error(err);
      setGameError(err.message || 'Could not initialize trivia game. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // START CHALLENGE OF THE DAY (Fixed category & identical questions for all users)
  const handleStartDailyChallenge = () => {
    setIsLoadingQuestions(true);
    setGameError(null);
    stopSpeech();

    try {
      const todays = getTodaysChallenge();

      // Find appropriate host or use current/featured host
      const featuredHost =
        PRESET_HOSTS.find((h) => h.id === todays.info.featuredHostId) || settings.host;

      setSettings((prev) => ({
        ...prev,
        host: featuredHost,
        category: todays.info.category,
        difficulty: todays.info.difficulty,
        questionCount: 5,
        isDailyChallenge: true,
        dailyChallengeDate: todays.info.dateKey,
      }));

      setQuestions(todays.questions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setHighestStreak(0);
      setHistory([]);
      setLifelines({ fiftyFifty: true, hostHint: true, searchRadar: true });
      setEliminatedOptions([]);
      setSelectedOption(null);
      setIsRevealed(false);
      setTimeRemaining(QUESTION_TIME_SECONDS);
      setGameState('playing');

      const firstQ = todays.questions[0];
      const introText = `Welcome to today's official Daily Challenge: ${todays.info.themeTitle}! All global contestants are competing on this identical board! Question 1: ${firstQ.question}`;
      setHostDialogue(introText);

      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(introText);
      }
    } catch (err: any) {
      console.error(err);
      setGameError('Could not launch Challenge of the Day.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // QUESTION TIMER LOOP
  useEffect(() => {
    if (gameState !== 'playing' || isRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 6 && !isSoundMuted) {
          SoundFX.tick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, isRevealed, currentQuestionIndex, isSoundMuted]);

  // Handle Timeout
  const handleTimeOut = async () => {
    if (isRevealed) return;
    setIsRevealed(true);
    if (!isSoundMuted) SoundFX.wrong();

    setStreak(0);
    const q = questions[currentQuestionIndex];

    setHistory((prev) => [
      ...prev,
      {
        question: q,
        userAnswerIndex: null,
        isCorrect: false,
        timeSpentSeconds: QUESTION_TIME_SECONDS,
        pointsEarned: 0,
      },
    ]);

    try {
      const res = await fetch('/api/trivia/host-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: settings.host.name,
          systemPrompt: settings.host.systemPrompt,
          eventType: 'timeout',
          question: q.question,
          selectedAnswer: 'Out of time',
          correctAnswer: q.options[q.correctAnswerIndex],
          streak: 0,
          score,
        }),
      });
      const data = await res.json();
      const reaction = data.commentary || 'Time is up on the clock!';
      setHostDialogue(reaction);
      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(reaction);
      }
    } catch (e) {
      setHostDialogue('Time expired! The correct answer was: ' + q.options[q.correctAnswerIndex]);
    }
  };

  // Handle Answer Selection
  const handleSelectOption = async (optionIndex: number) => {
    if (isRevealed || selectedOption !== null) return;

    setSelectedOption(optionIndex);
    setIsRevealed(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const q = questions[currentQuestionIndex];
    const isCorrect = optionIndex === q.correctAnswerIndex;
    const timeSpent = QUESTION_TIME_SECONDS - timeRemaining;

    let pointsEarned = 0;
    let newStreak = streak;

    if (isCorrect) {
      newStreak = streak + 1;
      const basePoints = 1000;
      const speedBonus = Math.max(0, timeRemaining * 50);
      const streakMultiplier = 1 + (newStreak - 1) * 0.25;
      const vipMultiplier = subscription.isPremium ? 1.25 : 1;
      pointsEarned = Math.round((basePoints + speedBonus) * streakMultiplier * vipMultiplier);

      setScore((s) => s + pointsEarned);
      setStreak(newStreak);
      setHighestStreak((h) => Math.max(h, newStreak));

      if (!isSoundMuted) {
        if (newStreak >= 3) {
          SoundFX.streak();
        } else {
          SoundFX.correct();
        }
      }
    } else {
      newStreak = 0;
      setStreak(0);
      if (!isSoundMuted) SoundFX.wrong();
    }

    setHistory((prev) => [
      ...prev,
      {
        question: q,
        userAnswerIndex: optionIndex,
        isCorrect,
        timeSpentSeconds: timeSpent,
        pointsEarned,
      },
    ]);

    try {
      const res = await fetch('/api/trivia/host-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: settings.host.name,
          systemPrompt: settings.host.systemPrompt,
          eventType: isCorrect ? (newStreak >= 3 ? 'streak3' : 'correct') : 'wrong',
          question: q.question,
          selectedAnswer: q.options[optionIndex],
          correctAnswer: q.options[q.correctAnswerIndex],
          streak: newStreak,
          score: score + pointsEarned,
        }),
      });

      const data = await res.json();
      const reaction = data.commentary || (isCorrect ? 'Spot on!' : 'Not quite!');
      setHostDialogue(reaction);

      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(reaction);
      }
    } catch (e) {
      const fallback = isCorrect
        ? `Boom! That is correct! +${pointsEarned} points!`
        : `Ouch, incorrect! The correct answer was: ${q.options[q.correctAnswerIndex]}`;
      setHostDialogue(fallback);
      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(fallback);
      }
    }
  };

  // Next Question or Finish Game
  const handleNextQuestion = async () => {
    stopSpeech();
    if (currentQuestionIndex + 1 < questions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedOption(null);
      setIsRevealed(false);
      setEliminatedOptions([]);
      setTimeRemaining(QUESTION_TIME_SECONDS);

      const nextQ = questions[nextIdx];
      const nextIntro = nextQ.hostDialogue || `Question ${nextIdx + 1}! Focus up!`;
      setHostDialogue(nextIntro);

      if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
        speak(`${nextIntro} ... ${nextQ.question}`);
      }
    } else {
      // GAME OVER
      setGameState('game-over');
      if (!isSoundMuted) SoundFX.fanfare();

      try {
        const correctCount = history.filter((h) => h.isCorrect).length;
        const totalCount = history.length;
        const res = await fetch('/api/trivia/host-react', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostName: settings.host.name,
            systemPrompt: settings.host.systemPrompt,
            eventType: 'gameover',
            question: `Game wrap-up: ${correctCount} correct out of ${totalCount}. Mode: ${settings.isDailyChallenge ? 'Daily Challenge' : 'Standard'}`,
            selectedAnswer: `Final Score: ${score}`,
            correctAnswer: 'Final assessment',
            streak: highestStreak,
            score,
          }),
        });

        const data = await res.json();
        const verdict =
          data.commentary ||
          `What a game! You scored ${score} points with ${correctCount} correct! Sensational effort!`;
        setHostFinalVerdict(verdict);
        setHostDialogue(verdict);
        if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
          speak(verdict);
        }
      } catch (e) {
        const verdict = `That wraps our game! You scored ${score} points!`;
        setHostFinalVerdict(verdict);
        setHostDialogue(verdict);
      }
    }
  };

  // Lifelines
  const handleUseFiftyFifty = () => {
    if (!subscription.isPremium && !lifelines.fiftyFifty) return;
    if (isRevealed) return;

    const q = questions[currentQuestionIndex];
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== q.correctAnswerIndex);

    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);

    setEliminatedOptions(toEliminate);
    if (!subscription.isPremium) {
      setLifelines((l) => ({ ...l, fiftyFifty: false }));
    }
    if (!isSoundMuted) SoundFX.lifeline();

    const remark = '50:50 deployed! Two incorrect choices have been incinerated from the board!';
    setHostDialogue(remark);
    if (settings.autoSpeakQuestions && !liveApi.isHostSpeaking) {
      speak(remark);
    }
  };

  const handleUseHostHint = async () => {
    if (!subscription.isPremium && !lifelines.hostHint) return;
    if (isRevealed) return;

    if (!subscription.isPremium) {
      setLifelines((l) => ({ ...l, hostHint: false }));
    }
    if (!isSoundMuted) SoundFX.lifeline();

    const q = questions[currentQuestionIndex];
    try {
      const res = await fetch('/api/trivia/host-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: settings.host.name,
          systemPrompt: settings.host.systemPrompt,
          eventType: 'lifeline',
          question: q.question,
          selectedAnswer: 'Player requested a clever hint without directly giving the answer away',
          correctAnswer: q.options[q.correctAnswerIndex],
          streak,
          score,
        }),
      });

      const data = await res.json();
      const hint = data.commentary || 'Think carefully about the timeline of these events!';
      setHostDialogue(hint);
      speak(hint);
    } catch (e) {
      const hint = `Here is your whisper: rule out the modern anachronisms!`;
      setHostDialogue(hint);
      speak(hint);
    }
  };

  const handleUseSearchRadar = async () => {
    if (!subscription.isPremium && !lifelines.searchRadar) return;
    if (isRevealed) return;

    if (!subscription.isPremium) {
      setLifelines((l) => ({ ...l, searchRadar: false }));
    }
    if (!isSoundMuted) SoundFX.lifeline();

    const q = questions[currentQuestionIndex];
    try {
      const res = await fetch('/api/trivia/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          answer: q.options[q.correctAnswerIndex],
          explanation: q.explanation,
        }),
      });

      const data = await res.json();
      const clue = `Google Search Radar Scan: ${data.factCheck?.slice(0, 150)}...`;
      setHostDialogue(clue);
      speak(clue);
    } catch (e) {
      const clue = 'Search Radar activated: Cross-referencing verified web facts for this topic!';
      setHostDialogue(clue);
      speak(clue);
    }
  };

  const handleReadCurrentQuestion = () => {
    if (!currentQ) return;
    const textToRead = `${currentQ.question}. Is it: A: ${currentQ.options[0]}, B: ${currentQ.options[1]}, C: ${currentQ.options[2]}, or D: ${currentQ.options[3]}?`;
    speak(textToRead);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-['Plus_Jakarta_Sans']">
      {/* Top Game Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              if (gameState !== 'setup') {
                if (window.confirm('Return to menu? Current game will end.')) {
                  setGameState('setup');
                  stopSpeech();
                }
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-['Cabinet_Grotesk'] block leading-none">
                TRIVIA<span className="text-amber-400">VERSE</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                AI Host Game Show
              </span>
            </div>
          </div>

          {/* Controls: Daily Challenge quick launch, Paytm VIP Pass, Live Voice Studio, Sound FX */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Challenge of the Day Top Button */}
            <button
              onClick={() => {
                if (gameState === 'playing') {
                  if (window.confirm('Leave current game and switch to Challenge of the Day?')) {
                    handleStartDailyChallenge();
                  }
                } else {
                  handleStartDailyChallenge();
                }
              }}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold items-center gap-1.5 shadow-sm transition-all"
              title="Play today's daily fixed category challenge"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Challenge</span>
            </button>

            {/* VIP Pass / Paytm Payment Gateway Button */}
            {subscription.isPremium ? (
              <div
                onClick={() => handleOpenUpgradeModal()}
                className="cursor-pointer px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00baf2]/20 to-amber-500/20 border border-[#00baf2]/40 text-[#00baf2] text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#00baf2]/10 hover:border-[#00baf2]"
                title="VIP Pass is active! Unlimited Lifelines & VIP Hosts unlocked"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Paytm VIP Pass</span>
                <span className="text-emerald-400 text-[10px] font-bold">Active</span>
              </div>
            ) : (
              <button
                onClick={() => handleOpenUpgradeModal('pass_vip')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#002970] to-[#00baf2]/30 hover:from-[#002970] hover:to-[#00baf2]/50 border border-[#00baf2]/50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00baf2]/15 transition-all transform hover:scale-105"
                title="Unlock VIP Hosts & Unlimited Lifelines via Paytm Gateway"
              >
                <div className="w-4 h-4 rounded bg-[#00baf2] text-[#002970] text-[9px] font-black flex items-center justify-center">
                  P
                </div>
                <span>Paytm VIP</span>
              </button>
            )}

            {/* Live API Voice Chat Button */}
            <button
              onClick={() => {
                setIsLiveModalOpen(true);
                if (liveApi.status === 'idle') {
                  liveApi.startLiveSession();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-md ${
                liveApi.status === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                  : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border-indigo-500/40'
              }`}
              title="Real-time two-way voice chat using Gemini 3.8 Live API"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {liveApi.status === 'connected' ? 'Live Voice Active' : 'Live Voice Studio'}
              </span>
              <span className="sm:hidden">Live</span>
            </button>

            {/* Top Scores Button */}
            <button
              onClick={() => {
                stopSpeech();
                setGameState('game-over');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-slate-300 hover:text-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
              title="View Top Scores Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* Sound FX Mute Toggle */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isSoundMuted ? 'Unmute game sounds' : 'Mute game sounds'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Current Host Badge in top bar if playing */}
            {gameState !== 'setup' && (
              <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl">
                <span className="text-lg">{settings.host.avatarEmoji}</span>
                <span className="text-xs font-bold text-slate-200">{settings.host.name}</span>
                {settings.isDailyChallenge && (
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Daily
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {gameError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{gameError}</span>
            </div>
            <button
              onClick={() => setGameError(null)}
              className="p-1 rounded-lg hover:bg-rose-900 text-rose-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SETUP SCREEN */}
        {gameState === 'setup' && (
          <SetupScreen
            settings={settings}
            subscription={subscription}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={handleStartGame}
            onStartDailyChallenge={handleStartDailyChallenge}
            isLoadingQuestions={isLoadingQuestions}
            onPreviewVoice={handlePreviewVoice}
            isPlayingPreview={isSpeaking}
            onOpenUpgradeModal={handleOpenUpgradeModal}
            onOpenLeaderboard={() => {
              stopSpeech();
              setGameState('game-over');
            }}
          />
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === 'playing' && currentQ && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Daily Challenge Banner Alert when in Daily mode */}
            {settings.isDailyChallenge && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Challenge of the Day Active:</span>
                  <span className="text-white">Fixed 5 Questions &bull; Competing for Today&apos;s Global Rank!</span>
                </div>
                <span className="text-amber-400 font-mono text-[11px] font-bold">
                  {settings.dailyChallengeDate}
                </span>
              </div>
            )}

            {/* Host Avatar Banner */}
            <HostAvatar
              host={settings.host}
              isSpeaking={isSpeaking || liveApi.isHostSpeaking}
              isLiveActive={liveApi.status === 'connected'}
              speechBubbleText={hostDialogue}
              mood={currentQ.hostMood || 'excited'}
              onReplaySpeech={() => {
                if (hostDialogue) speak(hostDialogue);
              }}
              onOpenLiveVoice={() => {
                setIsLiveModalOpen(true);
                if (liveApi.status === 'idle') {
                  liveApi.startLiveSession();
                }
              }}
            />

            {/* Lifelines & Score Status Bar */}
            <LifelinesBar
              score={score}
              streak={streak}
              timeRemaining={timeRemaining}
              totalTime={QUESTION_TIME_SECONDS}
              lifelines={lifelines}
              isRevealed={isRevealed}
              isPremium={subscription.isPremium}
              onUseFiftyFifty={handleUseFiftyFifty}
              onUseHostHint={handleUseHostHint}
              onUseSearchRadar={handleUseSearchRadar}
              onOpenUpgradeModal={handleOpenUpgradeModal}
            />

            {/* Question Card */}
            <QuestionCard
              question={currentQ}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedOption={selectedOption}
              isRevealed={isRevealed}
              eliminatedOptions={eliminatedOptions}
              isSpeaking={isSpeaking}
              onSelectOption={handleSelectOption}
              onReadQuestion={handleReadCurrentQuestion}
              onStopSpeech={stopSpeech}
            />

            {/* Next Question Navigation Bar */}
            {isRevealed && (
              <div className="flex justify-end pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={handleNextQuestion}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-orange-500/20 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>
                    {currentQuestionIndex + 1 < questions.length
                      ? 'Next Question'
                      : 'View Final Results'}
                  </span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'game-over' && (
          <GameOverScreen
            score={score}
            highestStreak={highestStreak}
            history={history}
            host={settings.host}
            settings={settings}
            subscription={subscription}
            hostFinalCommentary={hostFinalVerdict}
            isSpeaking={isSpeaking}
            onReplayCommentary={() => {
              if (hostFinalVerdict) speak(hostFinalVerdict);
            }}
            onPlayAgain={() => {
              if (settings.isDailyChallenge) {
                handleStartDailyChallenge();
              } else {
                handleStartGame();
              }
            }}
            onChangeHost={() => setGameState('setup')}
          />
        )}
      </main>

      {/* Paytm Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subscription={subscription}
        onUpgradeSuccess={handleUpgradeSuccess}
        preselectedTierId={preselectedTierId}
      />

      {/* Live Voice Studio Modal (Gemini 3.8 Live API) */}
      <LiveVoiceModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        host={settings.host}
        status={liveApi.status}
        errorMessage={liveApi.errorMessage}
        isHostSpeaking={liveApi.isHostSpeaking}
        isMicMuted={liveApi.isMicMuted}
        isMicAvailable={liveApi.isMicAvailable}
        userAudioLevel={liveApi.userAudioLevel}
        onToggleMute={liveApi.toggleMute}
        onStartLive={liveApi.startLiveSession}
        onStopLive={liveApi.stopLiveSession}
        onSendTextPrompt={(text) => liveApi.sendGameContextUpdate(text)}
        transcriptions={liveTranscriptions}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <p className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span>Challenge of the Day Mode</span>
          <span>&bull;</span>
          <span>Global Leaderboard Tracking</span>
          <span>&bull;</span>
          <span>Paytm Payment Gateway</span>
          <span>&bull;</span>
          <span>Gemini 3.8 Live API</span>
          <span>&bull;</span>
          <span>Gemini 3.8 Flash TTS</span>
        </p>
      </footer>
    </div>
  );
}
