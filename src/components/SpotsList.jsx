import { useState, useMemo } from 'react';
import {
  MapPin,
  Anchor,
  Waves,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { haversineDistance, bearing } from '../data/spots.js';

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function getScoreColor(score) {
  if (score >= 70) return { ring: '#22c55e', text: 'text-green-400' };
  if (score >= 40) return { ring: '#f59e0b', text: 'text-amber-400' };
  return { ring: '#ef4444', text: 'text-red-400' };
}

function ScoreCircle({ score }) {
  const { ring, text } = getScoreColor(score);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex-shrink-0 w-12 h-12">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-abyss-700/40"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={ring}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${text}`}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

const FILTER_TABS = [
  { value: 'all', label: 'Tous' },
  { value: 'bord', label: 'Du bord 🏖️' },
  { value: 'bateau', label: 'En bateau ⛵' },
  { value: 'favori', label: 'Mes spots 📍' },
];

export default function SpotsList({
  spots = [],
  scores = {},
  userPosition,
  onSelectSpot,
  filter = 'all',
  onFilterChange,
}) {
  const [sortBy, setSortBy] = useState('score');

  const enrichedSpots = useMemo(() => {
    return spots.map((spot) => {
      let distance = null;
      let dir = null;
      if (userPosition && spot.lat != null && spot.lng != null) {
        distance = haversineDistance(
          userPosition.lat,
          userPosition.lng,
          spot.lat,
          spot.lng
        );
        dir = bearing(
          userPosition.lat,
          userPosition.lng,
          spot.lat,
          spot.lng
        );
      }
      const scoreObj = scores[spot.id];
      const score = typeof scoreObj === 'object' && scoreObj !== null ? scoreObj.total : (scoreObj ?? spot.score ?? 50);
      return { ...spot, distance, bearing: dir, score };
    });
  }, [spots, scores, userPosition]);

  const filteredSpots = useMemo(() => {
    return enrichedSpots.filter((spot) => {
      if (filter === 'all') return true;
      if (filter === 'bord') return spot.type === 'bord';
      if (filter === 'bateau') return spot.type === 'bateau';
      if (filter === 'favori') return spot.favori === true || spot.type === 'favori';
      return true;
    });
  }, [enrichedSpots, filter]);

  const sortedSpots = useMemo(() => {
    const list = [...filteredSpots];
    if (sortBy === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    }
    return list;
  }, [filteredSpots, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex bg-abyss-900/80 p-1 rounded-xl border border-abyss-700/50 shadow overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange?.(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-abyss-600 text-white shadow'
                  : 'text-abyss-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs self-end">
          <span className="text-abyss-400">Trier par :</span>
          <button
            onClick={() => setSortBy('score')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortBy === 'score'
                ? 'bg-abyss-700 text-white font-medium'
                : 'text-abyss-400 hover:text-white'
            }`}
          >
            Score Dorade
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortBy === 'distance'
                ? 'bg-abyss-700 text-white font-medium'
                : 'text-abyss-400 hover:text-white'
            }`}
          >
            Distance GPS
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedSpots.map((spot) => (
          <div
            key={spot.id}
            onClick={() => onSelectSpot?.(spot)}
            className="glass-card-hover p-3 flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ScoreCircle score={spot.score} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base">{spot.icon || '🐟'}</span>
                  <h4 className="font-bold text-sm text-white truncate">
                    {spot.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-abyss-800 text-abyss-300 border border-abyss-700/50">
                    {spot.subType}
                  </span>
                </div>
                <p className="text-xs text-abyss-300 truncate mt-0.5">
                  {spot.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-abyss-400">
                  <span>{spot.bottom}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {spot.distance != null && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-white">
                    {formatDistance(spot.distance)}
                  </span>
                  <div className="text-[10px] text-abyss-400">
                    {(spot.distance * 0.539957).toFixed(1)} NM
                  </div>
                </div>
              )}
              <ChevronRight size={18} className="text-abyss-400" />
            </div>
          </div>
        ))}

        {sortedSpots.length === 0 && (
          <div className="glass-card p-8 text-center text-abyss-400">
            <p>Aucun spot dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
