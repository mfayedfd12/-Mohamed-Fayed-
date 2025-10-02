import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import type { HandChoice } from './types';
import { Hand } from './components/Hand';
import { BackIcon, PlusIcon, InfoIcon, BonusIcon, SettingsIcon, BoltIcon } from './components/Icon';
import { translations } from './translations';


const MIN_BET = 10;
const MAX_BET = 5000;
const STARTING_SCORE = 2000;
const REVEAL_DELAY_MS = 1500;
const MSG_DELAY_MS = 2500;
const EFFECT_DURATION_MS = 500;
const RECOVERY_DELAY_MS = 5000;

type ThemeKey = 'default' | 'nebula' | 'forest';

const themes = {
  default: {
    name: 'Default',
    '--bg-from': '#130129',
    '--bg-to': '#000000',
    '--bg-radial-accent': 'rgba(76,5,140,0.5)',
    '--primary': '#f59e0b', // amber-500
    '--primary-hover': '#fbbF24', // amber-400
    '--secondary': '#3b82f6', // blue-600
    '--secondary-hover': '#2563eb', // blue-700
    '--success': '#22c55e', // green-500
    '--danger': '#ef4444', // red-500
    '--text-main': '#e2e8f0', // slate-200
    '--text-muted': '#94a3b8', // slate-400
    '--surface-1': 'rgba(0,0,0,0.3)',
    '--surface-2': 'rgba(255,255,255,0.1)',
  },
  nebula: {
    name: 'Nebula',
    '--bg-from': '#0f172a', // slate-900
    '--bg-to': '#312e81', // indigo-900
    '--bg-radial-accent': 'rgba(129, 140, 248, 0.4)',
    '--primary': '#ec4899', // pink-500
    '--primary-hover': '#f472b6', // pink-400
    '--secondary': '#818cf8', // indigo-400
    '--secondary-hover': '#6366f1', // indigo-500
    '--success': '#34d399', // emerald-400
    '--danger': '#f87171', // red-400
    '--text-main': '#e2e8f0', // slate-200
    '--text-muted': '#94a3b8', // slate-400
    '--surface-1': 'rgba(0,0,0,0.3)',
    '--surface-2': 'rgba(255,255,255,0.1)',
  },
  forest: {
    name: 'Forest',
    '--bg-from': '#064e3b', // green-900
    '--bg-to': '#020617', // slate-950
    '--bg-radial-accent': 'rgba(5, 150, 105, 0.4)',
    '--primary': '#a3e635', // lime-400
    '--primary-hover': '#bef264', // lime-300
    '--secondary': '#22c55e', // green-500
    '--secondary-hover': '#16a34a', // green-600
    '--success': '#84cc16', // lime-500
    '--danger': '#f97316', // orange-500
    '--text-main': '#f0fdf4', // green-50
    '--text-muted': '#a1a1aa', // zinc-400
    '--surface-1': 'rgba(0,0,0,0.3)',
    '--surface-2': 'rgba(255,255,255,0.1)',
  }
};


class SoundEffects {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        return null;
      }
    }
    return this.audioContext;
  }

  private playSound(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startTime?: number
  ) {
    const context = this.getContext();
    if (!context) return;
    
    if (context.state === 'suspended') {
        context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const effectiveStartTime = startTime || context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, effectiveStartTime);
    
    gainNode.gain.setValueAtTime(volume, effectiveStartTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, effectiveStartTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(effectiveStartTime);
    oscillator.stop(effectiveStartTime + duration);
  }
  
  public playBetSound = () => {
    this.playSound(220, 0.15, 'square', 0.3);
  };

  public playWinSound = () => {
    const context = this.getContext();
    if (!context) return;
    const now = context.currentTime;
    this.playSound(523.25, 0.1, 'sine', 0.4, now); // C5
    this.playSound(659.25, 0.1, 'sine', 0.4, now + 0.1); // E5
    this.playSound(783.99, 0.15, 'sine', 0.4, now + 0.2); // G5
  };
  
  public playLoseSound = () => {
    this.playSound(164, 0.3, 'sawtooth', 0.3);
  };

  public playCashOutSound = () => {
    const context = this.getContext();
    if (!context) return;
    const now = context.currentTime;
    this.playSound(783.99, 0.1, 'triangle', 0.4, now); // G5
    this.playSound(1046.50, 0.2, 'triangle', 0.4, now + 0.1); // C6
  };
  
  public playDoubleUpSound = () => {
    const context = this.getContext();
    if (!context) return;
    const now = context.currentTime;
    this.playSound(440, 0.05, 'triangle', 0.5, now);
    this.playSound(880, 0.1, 'triangle', 0.5, now + 0.05);
  };
  
  public playButtonClickSound = () => {
    this.playSound(400, 0.08, 'triangle', 0.2);
  }
}

const soundEffects = new SoundEffects();


const StrategyModal = ({ onClose, t }: { onClose: () => void, t: typeof translations.en.strategy }) => {
    const handleClose = () => {
        soundEffects.playButtonClickSound();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
            <div className="bg-gradient-to-br from-slate-900 to-[var(--bg-from)] border border-[var(--surface-2)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-[var(--text-main)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--danger)] to-[var(--primary)]">{t.title}</h2>
                    <button onClick={handleClose} className="text-4xl font-thin text-slate-400 hover:text-white transition-colors leading-none">&times;</button>
                </div>
                
                <div className="space-y-4 text-right leading-relaxed font-sans">
                    <p className="p-3 text-center bg-[var(--danger)]/20 border border-[var(--danger)]/50 rounded-lg">
                        <strong>{t.warning.title}</strong> {t.warning.body}
                    </p>

                    <h3 className="text-xl font-semibold text-[var(--primary)] mt-6 border-b-2 border-[var(--primary)]/20 pb-2">{t.opponent.title}</h3>
                    <p>{t.opponent.body}</p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        {t.opponent.tactics.map((item, i) => <li key={i}><strong>{item.title}</strong> {item.body}</li>)}
                    </ul>

                    <h3 className="text-xl font-semibold text-[var(--success)] mt-6 border-b-2 border-[var(--success)]/20 pb-2">{t.howToWin.title}</h3>
                    <p>{t.howToWin.body}</p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        {t.howToWin.strategies.map((item, i) => <li key={i}><strong>{item.title}</strong> <span dangerouslySetInnerHTML={{ __html: item.body }} /></li>)}
                    </ul>
                    
                    <div className="text-center mt-8">
                        <button onClick={handleClose} className="py-2 px-8 font-bold bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-lg shadow-lg transition transform hover:scale-105 active:scale-100">
                            {t.closeButton}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = ({
    onClose,
    t,
    language,
    setLanguage,
    stats,
    isRoundDelayEnabled,
    setRoundDelayEnabled,
    isScoreHidden,
    setScoreHidden,
    theme,
    setTheme,
}: {
    onClose: () => void;
    t: typeof translations.en.settings;
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    stats: { wins: number; losses: number };
    isRoundDelayEnabled: boolean;
    setRoundDelayEnabled: (enabled: boolean) => void;
    isScoreHidden: boolean;
    setScoreHidden: (hidden: boolean) => void;
    theme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
}) => {
    const handleClose = () => {
        soundEffects.playButtonClickSound();
        onClose();
    };
    const winRate = stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(0) : 0;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleClose}>
            <div className="bg-gradient-to-br from-slate-900 to-[var(--bg-from)] border border-[var(--surface-2)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-[var(--text-main)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t.title}</h2>
                    <button onClick={handleClose} className="text-4xl font-thin text-[var(--text-muted)] hover:text-white transition-colors leading-none">&times;</button>
                </div>
                
                <div className="space-y-6">
                    {/* Theme */}
                    <div>
                        <h3 className="font-semibold mb-2">{t.theme.title}</h3>
                        <div className="grid grid-cols-3 gap-3">
                             {Object.keys(themes).map((themeKey) => {
                                const currentTheme = themes[themeKey as ThemeKey];
                                const isActive = themeKey === theme;
                                return (
                                    <button
                                    key={themeKey}
                                    onClick={() => setTheme(themeKey as ThemeKey)}
                                    className={`text-center p-2 rounded-lg transition-all border-2 ${isActive ? 'border-[var(--secondary)] bg-white/5' : 'border-transparent hover:bg-white/5'}`}
                                    >
                                    <div className="flex gap-1.5 h-6 w-full mb-2 rounded-md overflow-hidden p-1 bg-black/20">
                                        <span className="w-1/3 h-full rounded-sm" style={{backgroundColor: currentTheme['--bg-from']}}></span>
                                        <span className="w-1/3 h-full rounded-sm" style={{backgroundColor: currentTheme['--primary']}}></span>
                                        <span className="w-1/3 h-full rounded-sm" style={{backgroundColor: currentTheme['--secondary']}}></span>
                                    </div>
                                    <p className={`text-sm ${isActive ? 'text-[var(--text-main)] font-bold' : 'text-[var(--text-muted)]'}`}>{currentTheme.name}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Language */}
                    <div>
                        <h3 className="font-semibold mb-2">{t.language.title}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg transition-colors ${language === 'en' ? 'bg-[var(--secondary)] font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}>English</button>
                            <button onClick={() => setLanguage('ar')} className={`flex-1 py-2 rounded-lg transition-colors ${language === 'ar' ? 'bg-[var(--secondary)] font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}>العربية</button>
                        </div>
                    </div>
                    
                    {/* Statistics */}
                    <div>
                        <h3 className="font-semibold mb-2">{t.statistics.title}</h3>
                        <div className="grid grid-cols-3 gap-2 text-center bg-slate-800/50 p-3 rounded-lg">
                           <div>
                                <p className="text-2xl font-bold text-[var(--success)]">{stats.wins}</p>
                                <p className="text-sm text-[var(--text-muted)]">{t.statistics.wins}</p>
                           </div>
                           <div>
                                <p className="text-2xl font-bold text-[var(--danger)]">{stats.losses}</p>
                                <p className="text-sm text-[var(--text-muted)]">{t.statistics.losses}</p>
                           </div>
                           <div>
                                <p className="text-2xl font-bold text-[var(--secondary)]">{winRate}%</p>
                                <p className="text-sm text-[var(--text-muted)]">{t.statistics.winRate}</p>
                           </div>
                        </div>
                    </div>

                    {/* Recovery Tools */}
                    <div>
                        <h3 className="font-semibold mb-2">{t.recoveryTools.title}</h3>
                         <div className="space-y-3">
                            <label className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg cursor-pointer">
                                <div>
                                    <p className="font-medium">{t.recoveryTools.delay.title}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{t.recoveryTools.delay.description}</p>
                                </div>
                                <input type="checkbox" className="toggle-checkbox" checked={isRoundDelayEnabled} onChange={(e) => setRoundDelayEnabled(e.target.checked)} />
                            </label>
                            <label className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg cursor-pointer">
                                 <div>
                                    <p className="font-medium">{t.recoveryTools.hideScore.title}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{t.recoveryTools.hideScore.description}</p>
                                </div>
                                <input type="checkbox" className="toggle-checkbox" checked={isScoreHidden} onChange={(e) => setScoreHidden(e.target.checked)} />
                            </label>
                        </div>
                    </div>

                </div>
            </div>
             <style>{`
                .toggle-checkbox {
                    appearance: none;
                    width: 44px;
                    height: 24px;
                    background-color: #4a5568;
                    border-radius: 9999px;
                    position: relative;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out;
                }
                .toggle-checkbox:checked {
                    background-color: var(--secondary);
                }
                .toggle-checkbox::before {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: white;
                    border-radius: 50%;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s ease-in-out;
                }
                .toggle-checkbox:checked::before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};


const App: React.FC = () => {
  const [score, setScore] = useState<number>(STARTING_SCORE);
  const [bet, setBet] = useState<number>(MIN_BET);
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [correctHand, setCorrectHand] = useState<HandChoice | null>(null);
  const [chosenHand, setChosenHand] = useState<HandChoice | null>(null);
  const [currentWinnings, setCurrentWinnings] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [message, setMessage] = useState<string>('');
  const [visualEffect, setVisualEffect] = useState<'win' | 'lose' | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  
  // New State
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [isRoundDelayEnabled, setRoundDelayEnabled] = useState(false);
  const [isScoreHidden, setScoreHidden] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>('default');
  
  const t = translations[language];

  useEffect(() => {
    const currentTheme = themes[theme];
    const root = document.documentElement;
    Object.keys(currentTheme).forEach(key => {
        if (key !== 'name') {
            root.style.setProperty(key, currentTheme[key as keyof typeof currentTheme]);
        }
    });
    document.body.style.backgroundColor = currentTheme['--bg-to'];
  }, [theme]);

  useEffect(() => {
    setMessage(t.messages.placeBet);
  }, [language, t.messages.placeBet]);

  const playClick = useCallback(() => soundEffects.playButtonClickSound(), []);

  const handleRefill = () => {
    playClick();
    setScore(STARTING_SCORE);
    setMessage(t.messages.goodLuck);
    setBet(MIN_BET);
    setGameState(GameState.BETTING);
  };

  const handlePlaceBet = () => {
    if (bet > score || bet < MIN_BET) return;
    soundEffects.playBetSound();
    setScore(prev => prev - bet);
    setCurrentWinnings(0);
    setMultiplier(2);
    setChosenHand(null);
    setCorrectHand(Math.random() < 0.5 ? 'left' : 'right');
    setGameState(GameState.CHOOSING);
    setMessage(t.messages.guessFor.replace('{amount}', (bet * 2).toLocaleString()));
  };

  const handleChooseHand = (hand: HandChoice) => {
    if (gameState !== GameState.CHOOSING) return;
    
    if (hand !== 'left' && hand !== 'right') return;

    setChosenHand(hand);
    setGameState(GameState.REVEAL);
    setMessage('...');
  };
  
  const handleCashOut = () => {
      soundEffects.playCashOutSound();
      setScore(prev => prev + currentWinnings);
      setStats(prev => ({...prev, wins: prev.wins + 1}));
      setMessage(t.messages.youWon.replace('{amount}', currentWinnings.toLocaleString()));
      resetForNewRound();
  };
  
  const handleDoubleUp = () => {
      soundEffects.playDoubleUpSound();
      const nextMultiplier = multiplier * 2;
      setMultiplier(nextMultiplier);
      setCorrectHand(Math.random() < 0.5 ? 'left' : 'right');
      setChosenHand(null);
      setMessage(t.messages.guessFor.replace('{amount}', (bet * nextMultiplier).toLocaleString()));
      setGameState(GameState.CHOOSING);
  };

  const resetForNewRound = useCallback(() => {
    const performReset = () => {
        setGameState(GameState.BETTING);
        setCurrentWinnings(0);
        setMultiplier(2);
        setChosenHand(null);
        setCorrectHand(null);
        if (score < MIN_BET) {
            setMessage(t.messages.gameOver);
        } else {
            setMessage(t.messages.nextBet);
        }
    };
    
    if (isRoundDelayEnabled) {
        setMessage(t.messages.takeBreak);
        setTimeout(performReset, RECOVERY_DELAY_MS);
    } else {
        performReset();
    }
  }, [score, t.messages, isRoundDelayEnabled]);


  useEffect(() => {
    if (gameState === GameState.REVEAL && chosenHand) {
      const timer = setTimeout(() => {
        const isWin = chosenHand === correctHand;

        if (isWin) {
          soundEffects.playWinSound();
          setVisualEffect('win');
          const winnings = bet * multiplier;
          setCurrentWinnings(winnings);
          setGameState(GameState.BONUS_CHOICE);
          setMessage(t.messages.win.toUpperCase());
        } else {
          soundEffects.playLoseSound();
          setVisualEffect('lose');
          setStats(prev => ({...prev, losses: prev.losses + 1}));
          setMessage(t.messages.wrongHand);
          const resetTimer = setTimeout(resetForNewRound, MSG_DELAY_MS);
          return () => clearTimeout(resetTimer);
        }
        
        const effectTimer = setTimeout(() => setVisualEffect(null), EFFECT_DURATION_MS);
        return () => clearTimeout(effectTimer);

      }, REVEAL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [gameState, chosenHand, correctHand, bet, multiplier, resetForNewRound, t.messages]);

  const updateBet = (action: 'min' | 'max' | 'double' | 'half') => {
      playClick();
      let newBet = bet;
      switch (action) {
          case 'min': newBet = MIN_BET; break;
          case 'max': newBet = Math.min(score, MAX_BET); break;
          case 'double': newBet = bet * 2; break;
          case 'half': newBet = Math.floor(bet / 2); break;
      }
      setBet(Math.max(MIN_BET, Math.min(score, MAX_BET, newBet)));
  };

  const isGameOver = score < MIN_BET && gameState === GameState.BETTING;
  
  const visualEffectClasses = {
      win: 'animate-screen-flash-win',
      lose: 'animate-screen-flash-lose animate-shake',
      null: ''
  }[visualEffect];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen bg-[var(--bg-from)] text-[var(--text-main)] flex flex-col items-center font-sans`}>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(ellipse at top, var(--bg-radial-accent), transparent 60%)'}}></div>
        
        {isStrategyModalOpen && <StrategyModal onClose={() => setIsStrategyModalOpen(false)} t={t.strategy} />}
        {isSettingsModalOpen && <SettingsModal 
            onClose={() => setIsSettingsModalOpen(false)}
            t={t.settings}
            language={language}
            setLanguage={setLanguage}
            stats={stats}
            isRoundDelayEnabled={isRoundDelayEnabled}
            setRoundDelayEnabled={setRoundDelayEnabled}
            isScoreHidden={isScoreHidden}
            setScoreHidden={setScoreHidden}
            theme={theme}
            setTheme={setTheme}
        />}
        
        <div className={`w-full max-w-md flex-grow bg-[var(--surface-1)] sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden ${visualEffectClasses}`}>
        
            <header className="w-full flex justify-between items-center z-10 p-4 pt-6 flex-shrink-0">
              <button onClick={playClick} className="p-2 hover:bg-white/10 rounded-full transition-colors"><BackIcon className="w-6 h-6" /></button>
              <div className="flex items-center gap-2 py-1 px-3 bg-[var(--surface-1)] rounded-full border border-[var(--surface-2)]">
                {!isScoreHidden && <span className="text-xl font-bold tracking-wider">{score.toLocaleString()} $</span>}
                <button onClick={playClick} className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center text-black/80 font-bold hover:bg-[var(--primary-hover)] transition-colors"><PlusIcon className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { playClick(); setIsSettingsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><SettingsIcon className="w-6 h-6" /></button>
                <button onClick={() => { playClick(); setIsStrategyModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><InfoIcon className="w-6 h-6 text-[var(--secondary)]" /></button>
              </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-around w-full relative">
                <h2 className="text-2xl font-bold tracking-widest text-shadow uppercase z-10 text-center px-4 min-h-[64px] flex items-center">{message}</h2>
                
                <div className="w-full flex justify-center items-end gap-16 sm:gap-24 z-10">
                    <Hand side="left" onClick={handleChooseHand} disabled={gameState !== GameState.CHOOSING} isChosen={chosenHand === 'left'} isRevealed={gameState === GameState.REVEAL} isCorrect={correctHand === 'left'}/>
                    <Hand side="right" onClick={handleChooseHand} disabled={gameState !== GameState.CHOOSING} isChosen={chosenHand === 'right'} isRevealed={gameState === GameState.REVEAL} isCorrect={correctHand === 'right'}/>
                </div>
                
                 {gameState === GameState.BONUS_CHOICE && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
                        <div className="text-center p-6 bg-gradient-to-br from-slate-900 to-[var(--bg-from)] rounded-2xl shadow-2xl border border-[var(--surface-2)] w-11/12 max-w-sm">
                            <h2 className="text-4xl font-black text-shadow text-[var(--success)]">{t.bonus.title}</h2>
                            {!isScoreHidden && <>
                                <p className="text-lg mt-4 text-[var(--text-muted)]">{t.bonus.currentWinnings}</p>
                                <p className="text-4xl font-bold text-[var(--primary)] my-2 drop-shadow-lg">{currentWinnings.toLocaleString()}</p>
                            </>}
                            
                            {multiplier >= 32 ? (
                                <div className="mt-6">
                                    <p className="text-lg text-[var(--secondary)] mb-4">{t.bonus.maxMultiplier}</p>
                                    <button onClick={handleCashOut} className="w-full py-3 text-lg font-bold bg-[var(--success)] rounded-lg shadow-lg hover:brightness-110 transition transform hover:scale-105 active:scale-100 animate-pulse">
                                        {t.bonus.collect}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {!isScoreHidden && <p className="text-md text-[var(--text-muted)] mt-4">{t.bonus.nextPrize} <span className="font-bold text-[var(--primary)]">{(currentWinnings * 2).toLocaleString()}</span></p>}
                                    <div className="flex gap-4 w-full mt-6">
                                        <button onClick={handleCashOut} className="flex-1 py-3 text-lg font-bold bg-slate-600 rounded-lg shadow-lg hover:bg-slate-500 transition transform hover:scale-105 active:scale-100">
                                            {t.bonus.cashOut}
                                        </button>
                                        <button onClick={handleDoubleUp} className="flex-1 py-3 text-lg font-bold bg-[var(--primary)] text-black/80 hover:bg-[var(--primary-hover)] rounded-lg shadow-lg transition transform hover:scale-105 active:scale-100">
                                            {t.bonus.doubleUp}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="w-full flex flex-col items-center gap-4 z-10 p-4 flex-shrink-0">
                {isGameOver ? (
                    <div className="flex flex-col items-center gap-4 p-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl w-full border border-[var(--surface-2)]">
                        <h3 className="text-2xl font-bold text-[var(--danger)] text-shadow">{t.footer.gameOver}</h3>
                        <button onClick={handleRefill} className="w-full py-4 text-xl font-bold bg-[var(--primary)] text-black/80 hover:bg-[var(--primary-hover)] rounded-lg shadow-lg transition transform hover:scale-105 active:scale-100">
                            {t.footer.playAgain}
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-4 gap-2 w-full">
                        <button onClick={() => updateBet('min')} className="py-3 bg-[var(--surface-1)] backdrop-blur-sm rounded-lg hover:bg-[var(--surface-2)] border border-[var(--surface-2)] transition-colors">{t.footer.min}</button>
                        <button onClick={() => updateBet('double')} className="py-3 bg-[var(--surface-1)] backdrop-blur-sm rounded-lg hover:bg-[var(--surface-2)] border border-[var(--surface-2)] transition-colors">X2</button>
                        <button onClick={() => updateBet('half')} className="py-3 bg-[var(--surface-1)] backdrop-blur-sm rounded-lg hover:bg-[var(--surface-2)] border border-[var(--surface-2)] transition-colors">X/2</button>
                        <button onClick={() => updateBet('max')} className="py-3 bg-[var(--surface-1)] backdrop-blur-sm rounded-lg hover:bg-[var(--surface-2)] border border-[var(--surface-2)] transition-colors">{t.footer.max}</button>
                    </div>
                    <div className="flex items-center gap-2 w-full bg-slate-800/80 p-2 rounded-lg border border-[var(--surface-2)]">
                        <div className="flex-grow text-center">
                            {!isScoreHidden && <>
                               <p className="text-2xl font-bold">{bet.toLocaleString()} $</p>
                               <p className="text-xs text-[var(--text-muted)]">{t.footer.betRange.replace('{min}', MIN_BET.toString()).replace('{max}', MAX_BET.toString())}</p>
                            </>}
                            {isScoreHidden && <p className="text-lg font-bold text-[var(--text-muted)]">{t.footer.bettingBlindly}</p>}
                        </div>
                        <button
                            onClick={handlePlaceBet}
                            disabled={gameState !== GameState.BETTING || bet > score || isGameOver}
                            className="w-32 py-4 text-xl font-bold bg-[var(--primary)] text-black/80 hover:bg-[var(--primary-hover)] rounded-lg shadow-lg transition transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
                            >
                            {t.footer.stake}
                        </button>
                    </div>
                     <div className="w-full flex justify-center items-center text-[var(--text-muted)] text-sm px-2">
                        <button className="flex items-center gap-1">
                            <BoltIcon className="w-4 h-4 text-[var(--primary)]" />
                            <span className="font-semibold">
                                {t.footer.poweredBy}
                            </span>
                        </button>
                     </div>
                    </>
                )}
            </footer>
      </div>
    </div>
  );
};

export default App;