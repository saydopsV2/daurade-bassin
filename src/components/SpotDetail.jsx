import { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Thermometer,
  Anchor,
  Fish,
  ExternalLink,
  Compass,
  ArrowUp,
} from 'lucide-react';

function getScoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getBarColor(pct) {
  if (pct >= 0.7) return 'bg-green-500';
  if (pct >= 0.4) return 'bg-orange-400';
  return 'bg-red-500';
}

function bearingToCardinal(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

function ScoreRing({ score, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.8s ease-out',
          filter: `drop-shadow(0 0 4px ${color}60)`,
        }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="14"
        fontWeight="700"
        className="transform rotate-90 origin-center"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

function BreakdownBar({ label, value, max }) {
  const numVal = typeof value === 'object' && value !== null ? (value.score ?? 0) : (Number(value) || 0);
  const pct = Math.max(0, Math.min(numVal / max, 1));
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-abyss-200 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-abyss-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(pct)}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="text-xs text-abyss-300 w-12 text-right font-mono">
        {Math.round(numVal)}/{max}
      </span>
    </div>
  );
}

export default function SpotDetail({
  spot,
  score,
  scoreBreakdown,
  weather,
  marine,
  distance,
  bearing,
  userPosition,
  onClose,
  onLogCatch,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const distKm = distance != null ? distance.toFixed(1) : null;
  const distNm = distance != null ? (distance * 0.539957).toFixed(1) : null;
  const bearingDeg = bearing != null ? Math.round(bearing) : null;
  const cardinal = bearingDeg != null ? bearingToCardinal(bearingDeg) : null;

  const handleNavigate = () => {
    if (spot.type === 'bord') {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`,
        '_blank'
      );
    }
  };

  const isSheltered = spot.exposure?.sheltered_from?.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-[1001] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed z-[1002] transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 max-h-[85dvh] rounded-t-3xl overflow-y-auto overscroll-contain
          md:bottom-4 md:right-4 md:left-auto md:max-w-[420px] md:max-h-[calc(100vh-2rem)] md:rounded-2xl
          bg-abyss-950/95 backdrop-blur-xl border border-abyss-700/60 shadow-2xl
          ${visible ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none'}
        `}
      >
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 rounded-full bg-abyss-700/60" />
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-abyss-800 border border-abyss-700/50">
                <span className="text-2xl">{spot.icon || '🐟'}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">
                  {spot.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-abyss-800 text-abyss-300 border border-abyss-700/40">
                    {spot.subType}
                  </span>
                  <span className="text-xs text-abyss-400 capitalize">
                    {spot.type === 'bateau' ? 'En bateau' : 'Du bord'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ScoreRing score={score ?? 0} />
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-abyss-800 text-abyss-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {distance != null && (
            <div className="p-3.5 rounded-2xl bg-abyss-900/80 border border-abyss-700/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-abyss-200">
                <span className="flex items-center gap-1.5">
                  <Navigation size={14} className="text-blue-400" />
                  Distance &amp; Relèvement
                </span>
                <span className="text-white font-mono">{distKm} km · {distNm} NM</span>
              </div>

              {spot.type === 'bord' ? (
                <button
                  onClick={handleNavigate}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition-all active:scale-95"
                >
                  <ExternalLink size={14} />
                  Itinéraire GPS (Google Maps / Waze)
                </button>
              ) : (
                <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-xl bg-abyss-800/80 border border-abyss-700/40 text-xs">
                  <Compass size={16} className="text-sable-400" />
                  <span className="text-abyss-200">
                    Cap compas : <strong className="text-white">{bearingDeg}° {cardinal}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {(weather || marine) && (
            <div className="p-3.5 rounded-2xl bg-abyss-900/80 border border-abyss-700/40 space-y-2.5">
              <div className="text-xs font-semibold text-abyss-200 flex items-center gap-1.5">
                <Thermometer size={14} className="text-abyss-400" />
                Conditions en direct
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-abyss-800/60">
                  <span className="text-[10px] text-abyss-400 block">Eau</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {marine?.sea_surface_temperature != null ? `${marine.sea_surface_temperature.toFixed(1)}°C` : '18.0°C'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-abyss-800/60">
                  <span className="text-[10px] text-abyss-400 block">Vent</span>
                  <span className="font-bold text-white text-sm">
                    {weather?.wind_speed_10m != null ? `${Math.round(weather.wind_speed_10m * 0.539957)} kn` : '12 kn'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-abyss-800/60">
                  <span className="text-[10px] text-abyss-400 block">Pression</span>
                  <span className="font-bold text-white text-sm">
                    {weather?.surface_pressure != null ? `${Math.round(weather.surface_pressure)} hPa` : '1018 hPa'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {scoreBreakdown && (
            <div className="p-3.5 rounded-2xl bg-abyss-900/80 border border-abyss-700/40 space-y-2.5">
              <div className="text-xs font-semibold text-abyss-200 flex items-center gap-1.5">
                <Fish size={14} className="text-abyss-400" />
                Détail du Score Dorade
              </div>
              <div className="space-y-1.5">
                <BreakdownBar
                  label="Temp. eau"
                  value={scoreBreakdown.water?.score ?? scoreBreakdown.waterTemp ?? 0}
                  max={25}
                />
                <BreakdownBar
                  label="Vent / Abri"
                  value={scoreBreakdown.wind?.score ?? scoreBreakdown.wind ?? 0}
                  max={20}
                />
                <BreakdownBar
                  label="Pression"
                  value={scoreBreakdown.pressure?.score ?? scoreBreakdown.pressure ?? 0}
                  max={15}
                />
                <BreakdownBar
                  label="Luminosité"
                  value={scoreBreakdown.light?.score ?? scoreBreakdown.light ?? 0}
                  max={15}
                />
                <BreakdownBar
                  label="Marée"
                  value={scoreBreakdown.tide?.score ?? scoreBreakdown.tide ?? 0}
                  max={25}
                />
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-abyss-900/80 border border-abyss-700/40 space-y-3 text-xs">
            <div>
              <span className="text-abyss-400 font-semibold block mb-0.5">Nature du fond</span>
              <p className="text-gray-200">{spot.bottom}</p>
            </div>
            <div>
              <span className="text-abyss-400 font-semibold block mb-0.5">Moment idéal de marée</span>
              <p className="text-gray-200">{spot.idealTide}</p>
            </div>
            <div>
              <span className="text-abyss-400 font-semibold block mb-1">Appâts conseillés</span>
              <div className="flex flex-wrap gap-1.5">
                {spot.baits?.map((bait) => (
                  <span
                    key={bait}
                    className="px-2 py-0.5 rounded-md bg-abyss-800 text-sable-300 border border-abyss-700 text-[11px]"
                  >
                    {bait}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-abyss-400 font-semibold block mb-0.5">Plombée recommandée</span>
              <p className="text-gray-200">{spot.sinkerRange?.[0]}g à {spot.sinkerRange?.[1]}g selon le courant</p>
            </div>
            {spot.tips && (
              <div className="p-2.5 rounded-xl bg-abyss-800/60 border border-abyss-700/30">
                <span className="text-sable-400 font-bold block mb-0.5">💡 Astuce du local :</span>
                <p className="text-gray-300 italic">{spot.tips}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              handleClose();
              onLogCatch?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-green-900/30 transition-all active:scale-95"
          >
            <Fish size={18} />
            J'ai fait une prise ici !
          </button>
        </div>
      </div>
    </>
  );
}
