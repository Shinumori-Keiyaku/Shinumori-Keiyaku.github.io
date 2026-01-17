import React from 'react';
import { CardData } from '../types';
import { CardImage } from './CardImage';

interface CardItemProps {
  card: CardData;
  countInDeck: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onHover: (card: CardData | null, event?: React.MouseEvent) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, countInDeck, onClick, onContextMenu, onHover }) => {
  
  // Visual indicator for count
  const getCountColor = () => {
    if (countInDeck === 3) return 'bg-yellow-500 text-black';
    if (countInDeck > 0) return 'bg-blue-500 text-white';
    return 'bg-slate-700 text-slate-400';
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-transform duration-100 ${countInDeck === 3 ? 'opacity-50' : 'hover:scale-105'}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={(e) => onHover(card, e)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Card Frame - Square borders, updated aspect ratio 310/472 */}
      <div className={`border-2 ${countInDeck > 0 ? 'border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-700'} bg-slate-800 aspect-[310/472]`}>
        <CardImage 
          cardName={card.name} 
          type="thumbnail" 
          className="w-full h-full object-cover" 
        />
        {/* Name and Type overlays removed as requested */}
      </div>

      {/* Counter Badge */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${getCountColor()}`}>
        {countInDeck}
      </div>
    </div>
  );
};