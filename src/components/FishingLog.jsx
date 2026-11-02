import React, { useState, useMemo } from 'react';
import {
  Fish, MapPin, Thermometer, Wind, Trash2, Plus, Ruler,
  AlertTriangle, Calendar, Clock, X
} from 'lucide-react';

const BAIT_OPTIONS = [
  'Crabe vert',
  'Crabe mou',
  'Bibi',
  'Ver américain',
  'Couteau',
  'Mâchoiron',
  'Autre'
];

const MIN_SIZE = 23;

export default function FishingLog({ entries = [], onAdd, onRemove, onClear, userPosition, currentWeather, currentMarine }) {
  const [showModal, setShowModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [species, setSpecies] = useState('royale');
  const [taille, setTaille] = useState('');
  const [bait, setBait] = useState(BAIT_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)),
    [entries]
  );

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const totalSize = entries.reduce((sum, e) => sum + (e.taille || 0), 0);
    const avgSize = (totalSize / entries.length).toFixed(1);
    const royaleCount = entries.filter(e => e.species === 'royale').length;
    const griseCount = entries.filter(e => e.species === 'grise').length;

    return { total: entries.length, avgSize, royaleCount, griseCount };
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tailleNum = parseFloat(taille);
    if (!taille || isNaN(tailleNum) || tailleNum <= 0) return;

    const entry = {
      species,
      taille: tailleNum,
      bait,
      notes: notes.trim(),
      date: new Date().toISOString(),
      position: userPosition ? { lat: userPosition.lat, lng: userPosition.lng } : null,
      weather: (currentWeather || currentMarine)
        ? {
            waterTemp: currentMarine?.sea_surface_temperature ?? currentWeather?.waterTemp ?? null,
            windSpeed: currentWeather?.wind_speed_10m ?? null,
            pressure: currentWeather?.surface_pressure ?? null,
          }
        : null,
    };

    onAdd?.(entry);
    setShowModal(false);
    setTaille('');
    setNotes('');
  };

  const tailleNum = parseFloat(taille);
  const isBelowMin = !isNaN(tailleNum) && tailleNum > 0 && tailleNum < MIN_SIZE;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
                   bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                   text-white font-bold text-sm shadow-xl shadow-emerald-900/30
                   transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" />
        J'ai fait une prise ici !
      </button>

      {stats && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="glass-card p-3">
            <span className="text-abyss-400 block mb-0.5">Total prises</span>
            <span className="text-xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="glass-card p-3">
            <span className="text-abyss-400 block mb-0.5">Taille moy.</span>
            <span className="text-xl font-bold text-cyan-400">{stats.avgSize} cm</span>
          </div>
          <div className="glass-card p-3">
            <span className="text-abyss-400 block mb-0.5">Royales / Grises</span>
            <span className="text-sm font-bold text-sable-400 mt-1 block">
              👑 {stats.royaleCount} · 🐟 {stats.griseCount}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {sortedEntries.map((entry) => {
          const isLegal = entry.taille >= MIN_SIZE;
          return (
            <div key={entry.id} className="glass-card p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {entry.species === 'royale' ? '👑' : '🐟'}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {entry.species === 'royale' ? 'Dorade Royale' : 'Dorade Grise'}
                    </h4>
                    <span className="text-[10px] text-abyss-400">
                      {new Date(entry.date || entry.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    isLegal
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                  }`}>
                    {entry.taille} cm {!isLegal && '⚠️ Maille'}
                  </span>
                  <button
                    onClick={() => onRemove?.(entry.id)}
                    className="text-abyss-500 hover:text-red-400 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-abyss-300 pt-1 border-t border-abyss-700/30">
                {entry.bait && <span>🪱 Appât : <strong>{entry.bait}</strong></span>}
                {entry.position && (
                  <span>📍 GPS : {entry.position.lat.toFixed(4)}, {entry.position.lng.toFixed(4)}</span>
                )}
                {entry.weather?.waterTemp != null && (
                  <span>🌊 Eau : {entry.weather.waterTemp.toFixed(1)}°C</span>
                )}
              </div>

              {entry.notes && (
                <p className="text-xs text-gray-300 italic pt-1">
                  « {entry.notes} »
                </p>
              )}
            </div>
          );
        })}

        {sortedEntries.length === 0 && (
          <div className="glass-card p-8 text-center text-abyss-400 text-sm">
            <Fish size={32} className="mx-auto mb-2 text-abyss-600" />
            <p>Aucune prise enregistrée pour le moment.</p>
            <p className="text-xs text-abyss-500 mt-1">Utilisez le bouton ci-dessus dès votre première touche !</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Fish size={18} className="text-teal-400" />
                Enregistrer une prise
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-abyss-300 font-semibold block mb-1">Espèce</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpecies('royale')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      species === 'royale'
                        ? 'bg-sable-500/20 text-sable-300 border-sable-500'
                        : 'bg-abyss-800 text-gray-400 border-abyss-700'
                    }`}
                  >
                    👑 Dorade Royale
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecies('grise')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      species === 'grise'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-abyss-800 text-gray-400 border-abyss-700'
                    }`}
                  >
                    🐟 Dorade Grise
                  </button>
                </div>
              </div>

              <div>
                <label className="text-abyss-300 font-semibold block mb-1">Taille (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="80"
                  required
                  placeholder="ex: 32"
                  value={taille}
                  onChange={(e) => setTaille(e.target.value)}
                  className="w-full bg-abyss-800 border border-abyss-600 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-teal-400"
                />
                {isBelowMin && (
                  <div className="mt-1.5 p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>⚠️ Attention : Maille légale = <strong>23 cm minimum</strong>. Poisson à relâcher !</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-abyss-300 font-semibold block mb-1">Appât utilisé</label>
                <select
                  value={bait}
                  onChange={(e) => setBait(e.target.value)}
                  className="w-full bg-abyss-800 border border-abyss-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  {BAIT_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-abyss-300 font-semibold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="ex: Au montant, touche violente à 40m..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-abyss-800 border border-abyss-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-abyss-800/60 border border-abyss-700/40 text-[10px] text-abyss-400 space-y-0.5">
                <p>📍 GPS capturé automatiquement : {userPosition ? `${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}` : 'Position en cours...'}</p>
                <p>🌦️ Météo enregistrée : Eau {currentMarine?.sea_surface_temperature != null ? `${currentMarine.sea_surface_temperature.toFixed(1)}°C` : '18°C'}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary text-xs py-2"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary text-xs py-2"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
