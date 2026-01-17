import React, { useState, useMemo, useEffect } from 'react';
import { CARD_DATABASE } from './constants';
import { CardType, Deck, CardData } from './types';
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
    deck.forEach((entry) => count += entry.count);
    return count;
  }, [deck]);

  const deckList = useMemo(() => {
    return Array.from(deck.values()).sort((a, b) => a.card.index - b.card.index);
  }, [deck]);

  // Update Deck Code whenever deck changes
  useEffect(() => {
    const code = generateDeckCode(Array.from(deck.values()));
    setDeckCode(code);
  }, [deck]);

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

  // Prevent default context menu on grid to allow right-click removal logic if desired
  const handleContextMenu = (e: React.MouseEvent, card: CardData) => {
    e.preventDefault();
    removeFromDeck(card.index);
  };

  // Handle Hover with positioning logic
  const handleHover = (card: CardData | null, e?: React.MouseEvent) => {
    if (card && e) {
      // Determine if cursor is in the left or right half of the GRID (not screen).
      // Sidebar is 20rem (320px).
      const sidebarWidth = 320;
      const gridWidth = window.innerWidth - sidebarWidth;
      // Midpoint of the grid area in screen coordinates
      const gridMidpoint = sidebarWidth + (gridWidth / 2);
      
      const isCursorInLeftGrid = e.clientX < gridMidpoint;
      
      // If cursor is in left grid (Cols 1-4), show preview on Right.
      // If cursor is in right grid (Cols 5-8), show preview on Left.
      setPreviewPos(isCursorInLeftGrid ? 'right' : 'left');
    }
    setHoveredCard(card);
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {deckList.length === 0 ? (
            <div className="text-center text-slate-600 mt-10">
              <p>Your deck is empty.</p>
              <p className="text-xs mt-2">Click cards to add them.</p>
            </div>
          ) : (
            deckList.map(entry => (
              <div 
                key={entry.card.index}
                className="group flex items-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded p-2 transition-all cursor-pointer select-none"
                onClick={() => removeFromDeck(entry.card.index)}
                onMouseEnter={(e) => handleHover(entry.card, e)}
                onMouseLeave={() => handleHover(null)}
              >
                <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-slate-700 mr-3">
                  <CardImage cardName={entry.card.name} type="thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{entry.card.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{entry.card.type}</div>
                </div>
                <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 text-blue-400 font-bold text-xs border border-slate-700 ml-2">
                  {entry.count}
                </div>
                <div className="w-0 group-hover:w-6 overflow-hidden transition-all ml-1 text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
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
            className="mt-2 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded text-slate-300 transition-colors"
          >
            Copy Code
          </button>
        </div>
      </aside>

      {/* Main Content: Filter & Grid */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Top Bar: Filters */}
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

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {/* Updated grid columns to support up to 8 on xl screens */}
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
            <div className="w-full h-64 flex items-center justify-center text-slate-600">
              No cards found matching your filters.
            </div>
          )}
        </div>
      </main>

      {/* Large Image Preview Overlay (Hover) */}
      {hoveredCard && (
        <div className="fixed pointer-events-none z-50 hidden md:block" style={{ 
          top: '50%', 
          // Centers: 
          // Left position = Sidebar Width (20rem) + (0.25 * Grid Width)
          // Right position = Sidebar Width (20rem) + (0.75 * Grid Width)
          // Grid Width = 100vw - 20rem
          left: previewPos === 'right' 
            ? 'calc(20rem + ((100vw - 20rem) * 0.75))' 
            : 'calc(20rem + ((100vw - 20rem) * 0.25))', 
          transform: 'translate(-50%, -50%)' 
        }}>
           <div className="relative">
              <CardImage 
                cardName={hoveredCard.name} 
                type="image" 
                className="h-[80vh] max-w-none shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;