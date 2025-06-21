'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface CardConfig {
  id: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  component: React.ReactNode;
  defaultLayout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface DraggableCardLayoutProps {
  cards: CardConfig[];
  onLayoutChange?: (layout: any) => void;
  onCardToggle?: (cardId: string, visible: boolean) => void;
  className?: string;
  savedLayout?: any;
}

const DraggableCardLayout: React.FC<DraggableCardLayoutProps> = ({
  cards,
  onLayoutChange,
  onCardToggle,
  className = '',
  savedLayout
}) => {
  const [layouts, setLayouts] = useState<any>({});
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize layouts from card configs or saved layout
  useEffect(() => {
    const initialLayouts: any = {};
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
    
    breakpoints.forEach(breakpoint => {
      if (savedLayout && savedLayout[breakpoint]) {
        // Use saved layout but filter out cards that are no longer visible
        initialLayouts[breakpoint] = savedLayout[breakpoint].filter((item: any) => 
          cards.some(card => card.id === item.i && card.visible)
        );
      } else {
        // Use default layout for visible cards
        initialLayouts[breakpoint] = cards
          .filter(card => card.visible)
          .map(card => ({
            i: card.id,
            ...card.defaultLayout
          }));
      }
    });
    
    setLayouts(initialLayouts);
  }, [cards, savedLayout]);

  const handleLayoutChange = useCallback((currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    onLayoutChange?.(allLayouts);
  }, [onLayoutChange]);

  const handleCardToggle = useCallback((cardId: string, visible: boolean) => {
    onCardToggle?.(cardId, visible);
  }, [onCardToggle]);

  const toggleAllCards = useCallback((visible: boolean) => {
    cards.forEach(card => {
      onCardToggle?.(card.id, visible);
    });
  }, [cards, onCardToggle]);

  const resetLayout = useCallback(() => {
    const resetLayouts: any = {};
    const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs'];
    
    breakpoints.forEach(breakpoint => {
      resetLayouts[breakpoint] = cards
        .filter(card => card.visible)
        .map(card => ({
          i: card.id,
          ...card.defaultLayout
        }));
    });
    
    setLayouts(resetLayouts);
    onLayoutChange?.(resetLayouts);
  }, [cards, onLayoutChange]);

  const visibleCards = cards.filter(card => card.visible);

  return (
    <div className={`relative ${className}`}>
      {/* Settings Panel */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 border border-yellow-300/30 rounded-lg text-yellow-300 font-medium text-sm transition-all"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Layout Settings
          </button>
          {showSettings && (
            <>
              <button
                onClick={() => toggleAllCards(true)}
                className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-300/30 rounded-lg text-green-300 font-medium text-sm transition-all"
              >
                Show All
              </button>
              <button
                onClick={() => toggleAllCards(false)}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 rounded-lg text-red-300 font-medium text-sm transition-all"
              >
                Hide All
              </button>
              <button
                onClick={resetLayout}
                className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-300/30 rounded-lg text-blue-300 font-medium text-sm transition-all"
              >
                Reset Layout
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-white/75">
          <ArrowsPointingOutIcon className="w-4 h-4" />
          <span>Drag to reorder • Click settings to customize</span>
        </div>
      </div>

      {/* Card Toggle Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-yellow-300/20 rounded-xl backdrop-blur-sm">
          <h4 className="text-yellow-300 font-semibold mb-3">Toggle Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map(card => (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-yellow-300/10 hover:border-yellow-300/30 transition-all"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{card.title}</div>
                  {card.subtitle && (
                    <div className="text-sm text-white/60">{card.subtitle}</div>
                  )}
                </div>
                <button
                  onClick={() => handleCardToggle(card.id, !card.visible)}
                  className={`p-2 rounded-lg transition-all ${
                    card.visible
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  }`}
                >
                  {card.visible ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="relative">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          onLayoutChange={handleLayoutChange}
          onDragStart={() => setIsDragging(true)}
          onDragStop={() => setIsDragging(false)}
          onResizeStart={() => setIsDragging(true)}
          onResizeStop={() => setIsDragging(false)}
          isDraggable={true}
          isResizable={true}
          useCSSTransforms={true}
          preventCollision={false}
          compactType="vertical"
          autoSize={true}
          draggableHandle=".drag-handle"
          resizeHandles={['se', 'sw', 'ne', 'nw']}
        >
          {visibleCards.map(card => (
            <div
              key={card.id}
              className={`bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl backdrop-blur-sm relative overflow-hidden ${
                isDragging ? 'z-50' : ''
              }`}
            >
              {/* Drag Handle */}
              <div className="drag-handle absolute top-2 right-2 z-10 cursor-move p-1 rounded-lg bg-yellow-300/10 hover:bg-yellow-300/20 transition-all opacity-0 hover:opacity-100">
                <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              
              {/* Card Content */}
              <div className="h-full p-6">
                {card.component}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Empty State */}
      {visibleCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Cards Visible</h3>
          <p className="text-white/60 mb-4">Toggle on some cards in the settings to get started</p>
          <button
            onClick={() => toggleAllCards(true)}
            className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl font-semibold hover:bg-yellow-400 transition-all"
          >
            Show All Cards
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableCardLayout; 