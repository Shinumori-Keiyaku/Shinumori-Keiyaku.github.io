
import React, { useState, useMemo, useEffect } from 'react';
import { CARD_DATABASE } from './constants';
import { CardType, Deck, CardData, DeckEntry } from './types';
import { CardItem } from './components/CardItem';
import { generateDeckCode } from './utils/deckCodec';
import { CardImage } from './components/CardImage';

const App: React.FC = () => {
  // State
  const [deck, setDeck] = useState<Deck>(new Map());
  const [filter, setFilter] = useState<CardType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [hoveredCard, setHoveredCard] = useState<CardData | null>(null);
  const [previewPos, setPreviewPos] = useState<'left' | 'right'>('right');
  const [deckCode, setDeckCode] = useState('');

  // Sorting Priority Map
  const typePriority: Record<CardType, number> = {
    [CardType.UNIT]: 1,
    [CardType.SUPPORT]: 2,
    [CardType.BUILDING]: 3,
    [CardType.FIELD]: 4,
  };

  // Computed Properties
  const filteredCards = useMemo(() => {
    return CARD_DATABASE.filter(card => {
      const matchesType = filter === 'all' || card.type === filter;
      const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filter, search]);

  const totalCards = useMemo(() => {
    let count = 0;
    deck.forEach((entry: DeckEntry) => count += entry.count);
    return count;
  }, [deck]);

  const deckList = useMemo(() => {
    return Array.from(deck.values()).sort((a: DeckEntry, b: DeckEntry) => {
      // First sort by type priority
      const priorityA = typePriority[a.card.type];
      const priorityB = typePriority[b.card.type];
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Secondary sort by index for consistency within same type
      return a.card.index - b.card.index;
    });
  }, [deck]);

  // Update Deck Code whenever deck changes
  useEffect(() => {
    const code = generateDeckCode(Array.from(deck.values()));
    setDeckCode(code);
  }, [deck]);

  // Helper for type-based colors in the deck panel
  const getTypeColors = (type: CardType) => {
    switch (type) {
      case CardType.UNIT:
        return 'bg-red-950/40 hover:bg-red-900/60 border-red-900/50 text-red-100';
      case CardType.SUPPORT:
        return 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-900/50 text-blue-100';
      case CardType.BUILDING:
        return 'bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50 text-slate-100';
      case CardType.FIELD:
        return 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-900/50 text-emerald-100';
      default:
        return 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 text-slate-100';
    }
  };

  const getBadgeColor = (type: CardType) => {
    switch (type) {
      case CardType.UNIT: return 'text-red-400';
      case CardType.SUPPORT: return 'text-blue-400';
      case CardType.BUILDING: return 'text-slate-400';
      case CardType.FIELD: return 'text-emerald-400';
      default: return 'text-blue-400';
    }
  };

  // Handlers
  const addToDeck = (card: CardData) => {
    setDeck(prev => {
      const newDeck = new Map(prev);
      const entry = newDeck.get(card.index);
      if (entry) {
        if (entry.count < 3) {
          newDeck.set(card.index, { ...entry, count: entry.count + 1 });
        }
      } else {
        newDeck.set(card.index, { card, count: 1 });
      }
      return newDeck;
    });
  };

  const removeFromDeck = (cardId: number) => {
    setDeck(prev => {
      const newDeck = new Map(prev);
      const entry = newDeck.get(cardId);
      if (entry) {
        if (entry.count > 1) {
          newDeck.set(cardId, { ...entry, count: entry.count - 1 });
        } else {
          newDeck.delete(cardId);
        }
      }
      return newDeck;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, card: CardData) => {
    e.preventDefault();
    removeFromDeck(card.index);
  };

  const handleHover = (card: CardData | DeckEntry | null, e?: React.MouseEvent) => {
    if (card && e) {
      const sidebarWidth = 320;
      const gridWidth = window.innerWidth - sidebarWidth;
      const gridMidpoint = sidebarWidth + (gridWidth / 2);
      const isCursorInLeftGrid = e.clientX < gridMidpoint;
      setPreviewPos(isCursorInLeftGrid ? 'right' : 'left');
    }
    
    if (card && 'card' in card) {
      setHoveredCard(card.card);
    } else {
      setHoveredCard(card as CardData | null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden font-sans">
      
      {/* Left Sidebar: Deck List & Stats */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 z-20 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
            DECK BUILDER
          </h1>
          <p className="text-slate-400 text-xs mt-1">Construct your arsenal</p>
        </div>

        {/* Deck Stats */}
        <div className="px-6 py-4 bg-slate-900/50 flex justify-between items-center border-b border-slate-800">
          <span className="text-slate-400 font-semibold text-sm">Total Cards</span>
          <span className="text-2xl font-bold text-white">{totalCards}</span>
        </div>

        {/* Scrollable Deck List */}
        <div style={{padding: '0.2rem'}} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
          {deckList.length === 0 ? (
            <div className="text-center text-slate-600 mt-10">
              <p>Your deck is empty.</p>
              <p className="text-xs mt-2 text-slate-500 italic">Click grid cards to begin</p>
            </div>
          ) : (
            deckList.map(entry => (
              <div 
                key={entry.card.index}
                className={`group flex items-center border p-2 transition-all cursor-pointer select-none ${getTypeColors(entry.card.type)}`}
                onClick={() => addToDeck(entry.card)}
                onContextMenu={(e) => handleContextMenu(e, entry.card)}
                onMouseEnter={(e) => handleHover(entry, e)}
                onMouseLeave={() => handleHover(null)}
                title="Left-click: Add | Right-click: Remove"
              >
                <div className="h-12 w-12 overflow-hidden flex-shrink-0 bg-slate-950 mr-3 relative border border-white/10">
                  <CardImage 
                    cardName={entry.card.name} 
                    type="thumbnail" 
                    className="w-full h-full object-cover object-top scale-110 transform" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-[15px] font-bold truncate tracking-tight">{entry.card.name}</div>
                  <div className={`text-[10px] uppercase font-bold tracking-widest ${getBadgeColor(entry.card.type)}`}>{entry.card.type}</div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-slate-950/80 text-white font-black text-sm border border-white/10 ml-2 shadow-inner group-hover:border-white/30 transition-colors">
                  {entry.count}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Deck Code Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Deck Code</label>
          <textarea 
            id="myTextarea" 
            readOnly 
            value={deckCode}
            className="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-green-400 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(deckCode)}
            className="mt-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded text-slate-300 transition-colors border border-slate-700"
          >
            Copy Code
          </button>
        </div>
      </aside>

      {/* Main Content: Filter & Grid */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center space-x-2">
            {['all', ...Object.values(CardType)].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as CardType | 'all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === t 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search cards..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-full px-4 py-1.5 w-64 focus:outline-none focus:border-blue-500 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-20">
            {filteredCards.map(card => (
              <CardItem
                key={card.index}
                card={card}
                countInDeck={deck.get(card.index)?.count || 0}
                onClick={() => addToDeck(card)}
                onContextMenu={(e) => handleContextMenu(e, card)}
                onHover={handleHover}
              />
            ))}
          </div>
          {filteredCards.length === 0 && (
            <div className="w-full h-64 flex items-center justify-center text-slate-600 font-medium">
              No matching cards in the database.
            </div>
          )}
        </div>
      </main>

      {/* Large Image Preview Overlay (Hover) */}
      {hoveredCard && (
        <div className="fixed pointer-events-none z-50 hidden md:block" style={{ 
          top: '50%', 
          left: previewPos === 'right' 
            ? 'calc(20rem + ((100vw - 20rem) * 0.75))' 
            : 'calc(20rem + ((100vw - 20rem) * 0.25))', 
          transform: 'translate(-50%, -50%)' 
        }}>
           <div className="relative">
              <CardImage 
                cardName={hoveredCard.name} 
                type="image" 
                className="h-[80vh] max-w-none shadow-[0_0_80px_rgba(0,0,0,0.9)] border-4 border-slate-800" 
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
