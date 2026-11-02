import React from 'react';
import { Fish, Map, CloudSun, BookOpen, Navigation, Gauge, Anchor } from 'lucide-react';

const TABS = [
  { id: 'map', label: 'Carte', icon: Map },
  { id: 'spots', label: 'Spots', icon: Anchor },
  { id: 'meteo', label: 'Météo', icon: CloudSun },
  { id: 'carnet', label: 'Carnet', icon: BookOpen },
];

export default function Header({ activeTab, onTabChange, isTracking, speedKnots, onToggleTracking }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-abyss-950/90 backdrop-blur-lg border-b border-abyss-700/50">
        <div className="flex items-center justify-between px-4 h-14 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-abyss-500 to-sable-500 flex items-center justify-center shadow-lg">
              <Fish size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-100 leading-none">DauradeBassin</h1>
              <p className="text-[10px] text-abyss-400 leading-none mt-0.5">Bassin d'Arcachon</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-abyss-600 text-white shadow-lg'
                    : 'text-abyss-300 hover:text-white hover:bg-abyss-800/60'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isTracking && speedKnots !== null && (
              <div className="flex items-center gap-1.5 bg-abyss-800/80 rounded-lg px-2.5 py-1 border border-abyss-600/30">
                <Gauge size={13} className="text-abyss-400" />
                <span className="text-xs font-mono font-medium text-gray-200">
                  {speedKnots.toFixed(1)} <span className="text-abyss-400">kn</span>
                </span>
              </div>
            )}
            <button
              onClick={onToggleTracking}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
                isTracking
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-abyss-800 text-abyss-300 border border-abyss-600/30 hover:text-gray-200'
              }`}
            >
              <Navigation size={13} className={isTracking ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{isTracking ? 'GPS actif' : 'GPS'}</span>
              {isTracking && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-abyss-950/95 backdrop-blur-lg border-t border-abyss-700/50 safe-area-bottom md:hidden">
        <div className="flex items-stretch max-w-screen-xl mx-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-2.5 gap-0.5 transition-all duration-200 ${
                activeTab === id
                  ? 'text-abyss-400'
                  : 'text-abyss-600 hover:text-abyss-400'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all duration-200 ${
                activeTab === id ? 'bg-abyss-800' : ''
              }`}>
                <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.5} />
              </div>
              <span className={`text-[10px] leading-none ${
                activeTab === id ? 'font-semibold' : 'font-medium'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
