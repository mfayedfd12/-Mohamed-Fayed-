import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import type { HandChoice } from './types';
import { Hand } from './components/Hand';
import { BackIcon, PlusIcon, InfoIcon, BonusIcon, SettingsIcon, BoltIcon } from './components/Icon';

const MIN_BET = 10;
const MAX_BET = 5000;
const STARTING_SCORE = 2000;
const REVEAL_DELAY_MS = 1500;
const MSG_DELAY_MS = 2500;
const EFFECT_DURATION_MS = 500;

const StrategyModal = ({ onClose }: { onClose: () => void }) => (
  <div dir="rtl" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
    <div className="bg-gradient-to-br from-slate-900 to-[#130129] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-slate-200" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">أسرار اللعبة واستراتيجيتها</h2>
        <button onClick={onClose} className="text-4xl font-thin text-slate-400 hover:text-white transition-colors leading-none">&times;</button>
      </div>
      
      <div className="space-y-4 text-right leading-relaxed font-sans">
        <h3 className="text-xl font-semibold text-amber-300 mt-4 border-b-2 border-amber-300/20 pb-2">سر اللعبة الأساسي: لا يوجد تفكير!</h3>
        <p>
            أول وأهم حقيقة يجب أن تعرفها: <strong>اللعبة لا تفكر ولا تملك استراتيجية ضدك.</strong>
            إنها تعتمد على العشوائية بنسبة 100%. في كل مرة، يقوم الكمبيوتر بإجراء عملية تشبه رمي العملة المعدنية. لا يوجد نمط، ولا ذاكرة للجولات السابقة.
        </p>

        <h3 className="text-xl font-semibold text-amber-300 mt-6 border-b-2 border-amber-300/20 pb-2">استراتيجية اللاعب الذكي للفوز</h3>
        <p>الفوز في هذه اللعبة لا يعتمد على "الحظ" فقط، بل على إدارة المخاطر والانضباط.</p>
        <ul className="list-disc list-inside space-y-2 pr-4">
            <li><strong>إدارة الرصيد بحكمة:</strong> لا تراهن بكل شيء. القاعدة الذهبية هي المراهنة بمبلغ صغير (5-10%) من رصيدك.</li>
            <li><strong>اعرف متى تتوقف:</strong> زر "Cash Out" هو أقوى سلاح لديك. ربح صغير ومضمون أفضل من المخاطرة بخسارة كل شيء. اسحب أرباحك بعد فوز واحد أو فوزين على الأكثر.</li>
            <li><strong>لا تطارد خسائرك:</strong> إذا خسرت رهانًا كبيرًا، لا تحاول تعويضه برهان أكبر. عد إلى رهانك الأساسي الصغير.</li>
        </ul>

        <h3 className="text-xl font-semibold text-red-400 mt-6 border-b-2 border-red-400/20 pb-2">كيف "تجبرك" اللعبة على الخسارة؟</h3>
        <p>اللعبة لا تغش، لكنها مصممة بذكاء لاستغلال نقاط الضعف البشرية:</p>
        <ul className="list-disc list-inside space-y-2 pr-4">
            <li><strong>فخ المضاعفة "Double Up" (الطمع):</strong> كلما ضاعفت أكثر، زادت احتمالية خسارتك لكل شيء. الفوز 5 مرات متتالية احتماليته نادرة جدًا (1 من 32). اللاعبون يقعون في فخ الطمع ويخسرون كل الأرباح المتراكمة.</li>
            <li><strong>وهم الأنماط (مغالطة المقامر):</strong> عقلك قد يرى نمطًا غير موجود. كل جولة هي حدث مستقل وعشوائي تمامًا. لا تراهن بناءً على "حدسك" بأن دور اليد الأخرى قد حان.</li>
            <li><strong>سرعة وبساطة اللعبة (الإدمان):</strong> الجولات سريعة جدًا، مما يشجع على اللعب العاطفي وغير المدروس. قبل أن تدرك، تكون قد لعبت جولات كثيرة وخسرت جزءًا كبيرًا من رصيدك.</li>
        </ul>
        
         <div className="text-center mt-8">
             <button onClick={onClose} className="py-2 px-8 font-bold bg-amber-500 rounded-lg shadow-lg hover:bg-amber-400 transition transform hover:scale-105 active:scale-100">
                فهمت
            </button>
         </div>
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const [score, setScore] = useState<number>(STARTING_SCORE);
  const [bet, setBet] = useState<number>(MIN_BET);
  const [gameState, setGameState] = useState<GameState>(GameState.BETTING);
  const [correctHand, setCorrectHand] = useState<HandChoice | null>(null);
  const [chosenHand, setChosenHand] = useState<HandChoice | null>(null);
  const [currentWinnings, setCurrentWinnings] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(2);
  const [message, setMessage] = useState<string>('Place your bet to start!');
  const [visualEffect, setVisualEffect] = useState<'win' | 'lose' | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState<boolean>(false);


  const handleRefill = () => {
    setScore(STARTING_SCORE);
    setMessage('Good luck! Place your bet.');
    setBet(MIN_BET);
    setGameState(GameState.BETTING);
  };

  const handlePlaceBet = () => {
    if (bet > score || bet < MIN_BET) return;
    setScore(prev => prev - bet);
    setCurrentWinnings(0);
    setMultiplier(2); // Start with a 2x multiplier for the first win
    setChosenHand(null);
    setCorrectHand(Math.random() < 0.5 ? 'left' : 'right');
    setGameState(GameState.CHOOSING);
    setMessage(`Guess for ${(bet * 2).toLocaleString()} points`);
  };

  const handleChooseHand = (hand: HandChoice) => {
    if (gameState !== GameState.CHOOSING) return;
    setChosenHand(hand);
    setGameState(GameState.REVEAL);
    setMessage('...');
  };
  
  const handleCashOut = () => {
      setScore(prev => prev + currentWinnings);
      setMessage(`You won ${currentWinnings.toLocaleString()}!`);
      resetForNewRound();
  };
  
  const handleDoubleUp = () => {
      const nextMultiplier = multiplier * 2;
      setMultiplier(nextMultiplier);
      setCorrectHand(Math.random() < 0.5 ? 'left' : 'right');
      setChosenHand(null);
      setMessage(`Guess for ${(bet * nextMultiplier).toLocaleString()} points`);
      setGameState(GameState.CHOOSING);
  };

  const resetForNewRound = useCallback(() => {
    setGameState(GameState.BETTING);
    setCurrentWinnings(0);
    setMultiplier(2);
    setChosenHand(null);
    setCorrectHand(null);
    if (score < MIN_BET) {
        setMessage('Game Over! Refill to play again.');
    } else {
        setMessage('Place your next bet!');
    }
  }, [score]);


  useEffect(() => {
    if (gameState === GameState.REVEAL && chosenHand) {
      const timer = setTimeout(() => {
        const isWin = chosenHand === correctHand;

        if (isWin) {
          setVisualEffect('win');
          const winnings = bet * multiplier;
          setCurrentWinnings(winnings);
          setGameState(GameState.BONUS_CHOICE);
          setMessage(`YOU WIN!`);
        } else {
          setVisualEffect('lose');
          setMessage(`Wrong hand! You lost your bet.`);
          const resetTimer = setTimeout(resetForNewRound, MSG_DELAY_MS);
          return () => clearTimeout(resetTimer);
        }
        
        const effectTimer = setTimeout(() => setVisualEffect(null), EFFECT_DURATION_MS);
        return () => clearTimeout(effectTimer);

      }, REVEAL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [gameState, chosenHand, correctHand, bet, multiplier, resetForNewRound]);

  const updateBet = (action: 'min' | 'max' | 'double' | 'half') => {
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
    <div className={`min-h-screen bg-[#130129] text-white flex flex-col items-center justify-center font-sans p-2`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(76,5,140,0.5),_transparent_60%)]"></div>
        
        {isStrategyModalOpen && <StrategyModal onClose={() => setIsStrategyModalOpen(false)} />}
        
        {/* Mobile App Container */}
        <div className={`w-full max-w-md h-full sm:h-[844px] sm:max-h-[90vh] bg-black/30 sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden ${visualEffectClasses}`}>
        
            {/* Header */}
            <header className="w-full flex justify-between items-center z-10 p-4 pt-6 flex-shrink-0">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><BackIcon className="w-6 h-6" /></button>
              <div className="flex items-center gap-2 py-1 px-3 bg-black/30 rounded-full border border-white/10">
                <span className="text-xl font-bold tracking-wider">{score.toLocaleString()} $</span>
                <button className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-black/80 font-bold hover:bg-yellow-300 transition-colors"><PlusIcon className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><BonusIcon className="w-6 h-6 text-yellow-400" /></button>
                <button onClick={() => setIsStrategyModalOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><InfoIcon className="w-6 h-6 text-blue-300" /></button>
              </div>
            </header>

            {/* Game Area */}
            <main className="flex-grow flex flex-col items-center justify-around w-full relative">
                <h2 className="text-2xl font-bold tracking-widest text-shadow uppercase z-10 text-center px-4 min-h-[64px] flex items-center">{message}</h2>
                
                <div className="w-full flex justify-center items-end gap-16 sm:gap-24 z-10">
                    <Hand side="left" onClick={handleChooseHand} disabled={gameState !== GameState.CHOOSING} isChosen={chosenHand === 'left'} isRevealed={gameState === GameState.REVEAL} isCorrect={correctHand === 'left'}/>
                    <Hand side="right" onClick={handleChooseHand} disabled={gameState !== GameState.CHOOSING} isChosen={chosenHand === 'right'} isRevealed={gameState === GameState.REVEAL} isCorrect={correctHand === 'right'}/>
                </div>
                
                 {gameState === GameState.BONUS_CHOICE && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
                        <div className="text-center p-6 bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-2xl shadow-2xl border border-white/10 w-11/12 max-w-sm">
                            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500 text-shadow">YOU WIN!</h2>
                            <p className="text-lg mt-4 text-slate-300">Current winnings:</p>
                            <p className="text-4xl font-bold text-amber-400 my-2 drop-shadow-lg">{currentWinnings.toLocaleString()}</p>
                            
                            {multiplier >= 32 ? (
                                <div className="mt-6">
                                    <p className="text-lg text-cyan-300 mb-4">Max multiplier (32x) reached!</p>
                                    <button onClick={handleCashOut} className="w-full py-3 text-lg font-bold bg-green-500 rounded-lg shadow-lg hover:bg-green-400 transition transform hover:scale-105 active:scale-100 animate-pulse">
                                        COLLECT WINNINGS
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-md text-slate-300 mt-4">Next prize: <span className="font-bold text-amber-300">{(currentWinnings * 2).toLocaleString()}</span></p>
                                    <div className="flex gap-4 w-full mt-6">
                                        <button onClick={handleCashOut} className="flex-1 py-3 text-lg font-bold bg-slate-600 rounded-lg shadow-lg hover:bg-slate-500 transition transform hover:scale-105 active:scale-100">
                                            Cash Out
                                        </button>
                                        <button onClick={handleDoubleUp} className="flex-1 py-3 text-lg font-bold bg-amber-500 rounded-lg shadow-lg hover:bg-amber-400 transition transform hover:scale-105 active:scale-100">
                                            Double Up
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
            
            {/* Footer */}
            <footer className="w-full flex flex-col items-center gap-4 z-10 p-4 flex-shrink-0">
                {isGameOver ? (
                    <div className="flex flex-col items-center gap-4 p-6 bg-slate-800/80 backdrop-blur-sm rounded-2xl w-full border border-white/10">
                        <h3 className="text-2xl font-bold text-red-500 text-shadow">Game Over</h3>
                        <button onClick={handleRefill} className="w-full py-4 text-xl font-bold bg-amber-500 rounded-lg shadow-lg hover:bg-amber-400 transition transform hover:scale-105 active:scale-100">
                            Play Again
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-4 gap-2 w-full">
                        <button onClick={() => updateBet('min')} className="py-3 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-white/10 border border-white/10 transition-colors">MIN</button>
                        <button onClick={() => updateBet('double')} className="py-3 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-white/10 border border-white/10 transition-colors">X2</button>
                        <button onClick={() => updateBet('half')} className="py-3 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-white/10 border border-white/10 transition-colors">X/2</button>
                        <button onClick={() => updateBet('max')} className="py-3 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-white/10 border border-white/10 transition-colors">MAX</button>
                    </div>
                    <div className="flex items-center gap-2 w-full bg-slate-800/80 p-2 rounded-lg border border-white/10">
                        <div className="flex-grow text-center">
                            <p className="text-2xl font-bold">{bet.toLocaleString()} $</p>
                            <p className="text-xs text-slate-400">min {MIN_BET}$ - max {MAX_BET}$</p>
                        </div>
                        <button
                            onClick={handlePlaceBet}
                            disabled={gameState !== GameState.BETTING || bet > score || isGameOver}
                            className="w-32 py-4 text-xl font-bold bg-amber-500 rounded-lg shadow-lg hover:bg-amber-400 transition transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
                            >
                            STAKE
                        </button>
                    </div>
                     <div className="w-full flex justify-between items-center text-slate-400 text-sm px-2">
                        <button className="flex items-center gap-1 hover:text-white transition-colors"><SettingsIcon className="w-4 h-4" /> SETTINGS</button>
                        <button className="flex items-center gap-1">
                            <BoltIcon className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold">
                                مدعومة بتقنية M&F AI
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