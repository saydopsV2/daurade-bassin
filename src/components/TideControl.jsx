import React, { useState } from 'react';
import { Waves, Clock, TrendingUp, Info, ExternalLink, Check } from 'lucide-react';
import { getEstimatedTideForDate } from '../utils/tides.js';

export default function TideControl({ highTideHour, coefficient, onHighTideChange, onCoefficientChange }) {
  const [showHelp, setShowHelp] = useState(false);

  const handleApplyOfficialToday = (hour, coeff) => {
    onHighTideChange(hour);
    onCoefficientChange(coeff);
  };

  return (
    <div className="glass-card p-4 space-y-4 border-abyss-600/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves size={18} className="text-abyss-400" />
          <div>
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              Marée — Arcachon (Jetée d'Eyrac)
            </h3>
            <p className="text-[10px] text-abyss-400">Port de référence SHOM #136</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-abyss-400 hover:text-abyss-200 p-1 rounded-lg transition-colors"
          title="Comment fonctionne la marée ?"
        >
          <Info size={16} />
        </button>
      </div>

      <div className="bg-abyss-800/60 rounded-xl p-3 border border-abyss-700/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-abyss-200">
          <span>Horaires réels aujourd'hui :</span>
          <span className="text-sable-400 font-bold">Coeff. 47 (Morte-eau)</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleApplyOfficialToday(11.15, 47)}
            className="flex items-center justify-between p-2 rounded-lg bg-abyss-900/80 hover:bg-abyss-700/80 border border-abyss-600/40 transition-all text-left"
          >
            <div>
              <div className="text-[10px] text-abyss-400">🌊 Pleine Mer Matin</div>
              <div className="font-bold text-white text-sm">11h09 <span className="text-[10px] text-abyss-300 font-normal">(3.67m)</span></div>
            </div>
            {Math.abs((highTideHour || 0) - 11.15) < 0.2 && <Check size={14} className="text-green-400" />}
          </button>

          <button
            onClick={() => handleApplyOfficialToday(23.68, 47)}
            className="flex items-center justify-between p-2 rounded-lg bg-abyss-900/80 hover:bg-abyss-700/80 border border-abyss-600/40 transition-all text-left"
          >
            <div>
              <div className="text-[10px] text-abyss-400">🌊 Pleine Mer Soir</div>
              <div className="font-bold text-white text-sm">23h41 <span className="text-[10px] text-abyss-300 font-normal">(3.44m)</span></div>
            </div>
            {Math.abs((highTideHour || 0) - 23.68) < 0.2 && <Check size={14} className="text-green-400" />}
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] text-abyss-400 pt-1 border-t border-abyss-700/30">
          <span>Basses mers : 04h19 (1.37m) · 17h12 (1.26m)</span>
          <a
            href="https://maree.info/136"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sable-400 hover:text-sable-300 underline"
          >
            <span>Maree.info #136</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {showHelp && (
        <div className="text-xs text-abyss-200 bg-abyss-800/80 rounded-xl p-3 border border-abyss-600/30 space-y-1.5 animate-fade-in">
          <p className="font-semibold text-sable-400">📡 D'où proviennent les marées ?</p>
          <p>
            Les APIs météo ouvertes (Open-Meteo) ne fournissent pas les coefficients de marée français (spécificité hydrographique du SHOM calculée pour le port de Brest).
          </p>
          <p>
            L'application est donc pré-calibrée sur les marées réelles d'Arcachon (Jetée d'Eyrac). Vous pouvez sélectionner en un clic la pleine mer du matin (11h09) ou du soir (23h41) ou saisir vos propres horaires.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-abyss-300 flex items-center gap-1">
            <Clock size={12} />
            Pleine Mer active
          </label>
          <input
            type="time"
            value={
              highTideHour !== null && highTideHour !== undefined
                ? `${String(Math.floor(highTideHour)).padStart(2, '0')}:${String(
                    Math.round((highTideHour % 1) * 60)
                  ).padStart(2, '0')}`
                : '11:09'
            }
            onChange={(e) => {
              if (e.target.value) {
                const [h, m] = e.target.value.split(':').map(Number);
                onHighTideChange(h + m / 60);
              } else {
                onHighTideChange(null);
              }
            }}
            className="w-full bg-abyss-800 border border-abyss-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-abyss-400 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-abyss-300 flex items-center gap-1">
            <TrendingUp size={12} />
            Coefficient (20 - 120)
          </label>
          <input
            type="number"
            min="20"
            max="120"
            step="1"
            value={coefficient ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              onCoefficientChange(val);
            }}
            placeholder="ex: 47"
            className="w-full bg-abyss-800 border border-abyss-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-abyss-500 focus:outline-none focus:border-abyss-400 transition-colors"
          />
        </div>
      </div>

      {coefficient !== null && coefficient !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-abyss-400">20 (Morte-eau)</span>
            <span
              className={`font-semibold ${
                coefficient >= 45 && coefficient <= 80
                  ? 'text-green-400'
                  : coefficient > 85
                  ? 'text-orange-400'
                  : 'text-abyss-300'
              }`}
            >
              Coeff. {coefficient}
              {coefficient >= 45 && coefficient <= 80 && ' ✓ Idéal dorade'}
              {coefficient > 85 && ' ⚠️ Courant fort'}
              {coefficient < 45 && ' 💧 Faible courant'}
            </span>
            <span className="text-abyss-400">120 (Vive-eau)</span>
          </div>
          <div className="h-2 bg-abyss-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coefficient >= 45 && coefficient <= 80
                  ? 'bg-green-500'
                  : coefficient > 85
                  ? 'bg-orange-500'
                  : 'bg-abyss-500'
              }`}
              style={{ width: `${Math.min(100, (coefficient / 120) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
