import React from 'react';
import { FistIcon, OpenHandIcon, CoinIcon } from './Icon';
import type { HandChoice } from '../types';

interface HandProps {
  side: HandChoice;
  isChosen: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onClick: (side: HandChoice) => void;
  disabled: boolean;
}

export const Hand: React.FC<HandProps> = ({ side, isChosen, isCorrect, isRevealed, onClick, disabled }) => {
  const handClasses = `w-32 h-32 sm:w-40 sm:h-40 cursor-pointer transition-all duration-300 transform-gpu ${side === 'right' ? 'scale-x-[-1]' : ''}`;
  
  const revealClasses = isRevealed && !isCorrect ? 'opacity-40 grayscale' : '';

  const renderContent = () => {
    if (!isRevealed) {
      return <FistIcon className={`${handClasses} ${isChosen ? 'shadow-glow' : 'hover:scale-110'}`} />;
    }

    // Reveal State
    return (
        <div className={`relative ${handClasses} ${revealClasses}`}>
            <OpenHandIcon className="w-full h-full" />
            {isCorrect && (
                <CoinIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-amber-400 animate-coin-appear" />
            )}
        </div>
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onClick(side)}
    >
      {renderContent()}
    </div>
  );
};