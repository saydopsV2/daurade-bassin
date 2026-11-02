import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
  Line,
  Legend,
} from 'recharts';
import {
  Thermometer,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Waves,
  Gauge,
  Eye,
  RefreshCw,
  WifiOff,
  ArrowDown,
  ArrowUp,
  Clock,
} from 'lucide-react';

const CHART_COLORS = {
  waterTemp: '#06b6d4',
  airTemp: '#f97316',
  wind: '#14b8a6',
  waves: '#3b82f6',
  gusts: '#ef4444',
  precipitation: '#8b5cf6',
};

const CHART_THEME = {
  grid: '#003f75',
  axisTick: '#66a5db',
  tooltipBg: '#002a4e',
};

function formatHour(isoString) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function ConditionCard({ icon: Icon, label, value, unit, subtitle, highlight, iconClassName }) {
  return (
    <div
      className={`glass-card p-3.5 flex flex-col gap-1 transition-colors ${
        highlight ? 'ring-1 ring-cyan-400/40 bg-cyan-950/20' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 text-abyss-300 text-[11px] uppercase tracking-wide">
        <Icon size={14} className={iconClassName || 'text-abyss-300'} />
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold text-abyss-50">
        {value ?? '--'}
        {unit && <span className="text-xs font-normal text-abyss-300 ml-1">{unit}</span>}
      </div>
      {subtitle && <div className="text-[10px] text-abyss-400">{subtitle}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded-xl border border-abyss-600/50 px-3 py-2 text-xs shadow-xl"
      style={{ backgroundColor: CHART_THEME.tooltipBg }}
    >
      <p className="text-abyss-300 mb-1 font-semibold">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value != null ? Number(entry.value).toFixed(1) : '--'}{' '}
          {entry.unit || ''}
        </p>
      ))}
    </div>
  );
}

export default function WeatherDashboard({
  weather,
  marine,
  loading,
  error,
  usingFallback,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('today');

  const current = weather?.current;
  const marineCurrent = marine?.current;
  const hourly = weather?.hourly;
  const marineHourly = marine?.hourly;
  const daily = weather?.daily;

  const sunrise = daily?.sunrise?.[0];
  const sunset = daily?.sunset?.[0];

  const chartData = useMemo(() => {
    if (!hourly?.time) return [];
    const count = activeTab === 'today' ? 24 : Math.min(hourly.time.length, 168);
    const step = activeTab === 'today' ? 1 : 3;
    const data = [];

    for (let i = 0; i < count; i += step) {
      data.push({
        time: activeTab === 'today' ? formatHour(hourly.time[i]) : new Date(hourly.time[i]).toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit' }),
        airTemp: hourly.temperature_2m?.[i],
        waterTemp: marineHourly?.sea_surface_temperature?.[i] ?? marineHourly?.sea_surface_temperature?.[0],
        windSpeed: hourly.wind_speed_10m?.[i],
        windGusts: hourly.wind_gusts_10m?.[i],
        waveHeight: marineHourly?.wave_height?.[i],
        pressure: hourly.surface_pressure?.[i],
      });
    }
    return data;
  }, [hourly, marineHourly, activeTab]);

  return (
    <div className="space-y-4">
      {usingFallback && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>📡 Signal réseau faible — Données météo de secours actives.</span>
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Cartes météo en direct */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <ConditionCard
          icon={Thermometer}
          iconClassName="text-orange-400"
          label="Temp. Air"
          value={current?.temperature_2m != null ? current.temperature_2m.toFixed(1) : null}
          unit="°C"
        />

        <ConditionCard
          icon={Thermometer}
          iconClassName="text-cyan-400"
          label="Temp. Eau"
          value={marineCurrent?.sea_surface_temperature != null ? marineCurrent.sea_surface_temperature.toFixed(1) : null}
          unit="°C"
          highlight={marineCurrent?.sea_surface_temperature >= 16 && marineCurrent?.sea_surface_temperature <= 22}
          subtitle={marineCurrent?.sea_surface_temperature >= 16 && marineCurrent?.sea_surface_temperature <= 22 ? '✓ Optimum dorade' : undefined}
        />

        <ConditionCard
          icon={Wind}
          iconClassName="text-teal-400"
          label="Vent"
          value={current?.wind_speed_10m != null ? Math.round(current.wind_speed_10m * 0.539957) : null}
          unit="kn"
          subtitle={current?.wind_gusts_10m != null ? `Rafales ${Math.round(current.wind_gusts_10m * 0.539957)} kn` : undefined}
        />

        <ConditionCard
          icon={Gauge}
          iconClassName="text-yellow-400"
          label="Pression"
          value={current?.surface_pressure != null ? Math.round(current.surface_pressure) : null}
          unit="hPa"
          subtitle={current?.surface_pressure >= 1015 && current?.surface_pressure <= 1025 ? '✓ Baromètre stable' : undefined}
        />

        <ConditionCard
          icon={Waves}
          iconClassName="text-blue-400"
          label="Houle"
          value={marineCurrent?.wave_height != null ? marineCurrent.wave_height.toFixed(1) : null}
          unit="m"
          subtitle={marineCurrent?.wave_period != null ? `Période ${Math.round(marineCurrent.wave_period)}s` : undefined}
        />

        <ConditionCard
          icon={CloudRain}
          iconClassName="text-violet-400"
          label="Pluie"
          value={current?.precipitation != null ? current.precipitation.toFixed(1) : null}
          unit="mm"
        />

        <ConditionCard
          icon={Eye}
          label="Nuages"
          value={current?.cloud_cover != null ? Math.round(current.cloud_cover) : null}
          unit="%"
        />

        <ConditionCard
          icon={Droplets}
          iconClassName="text-blue-300"
          label="Courant"
          value={marineCurrent?.ocean_current_velocity != null ? marineCurrent.ocean_current_velocity.toFixed(2) : '--'}
          unit="m/s"
        />
      </div>

      {(sunrise || sunset) && (
        <div className="glass-card p-3 flex items-center justify-center gap-6 text-xs text-abyss-200">
          <div className="flex items-center gap-1.5">
            <Sun size={15} className="text-yellow-400" />
            <ArrowUp size={12} className="text-yellow-400" />
            <span>Lever : <strong className="text-white">{formatTime(sunrise)}</strong></span>
          </div>
          <div className="w-px h-4 bg-abyss-700" />
          <div className="flex items-center gap-1.5">
            <Sun size={15} className="text-orange-400" />
            <ArrowDown size={12} className="text-orange-400" />
            <span>Coucher : <strong className="text-white">{formatTime(sunset)}</strong></span>
          </div>
        </div>
      )}

      {/* Graphiques prévisions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-abyss-400" />
            <h3 className="text-sm font-bold text-white">Prévisions heure par heure</h3>
          </div>
          <div className="flex bg-abyss-900/80 p-0.5 rounded-lg border border-abyss-700/50 text-xs">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'today' ? 'bg-abyss-600 text-white' : 'text-abyss-400'
              }`}
            >
              24 heures
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'week' ? 'bg-abyss-600 text-white' : 'text-abyss-400'
              }`}
            >
              7 jours
            </button>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="glass-card p-4 space-y-2 min-w-0">
              <h4 className="text-xs font-semibold text-abyss-200">Températures (°C) — Air vs Eau</h4>
              <div className="h-[200px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="time" tick={{ fill: CHART_THEME.axisTick, fontSize: 10 }} />
                    <YAxis tick={{ fill: CHART_THEME.axisTick, fontSize: 10 }} unit="°C" />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: CHART_THEME.axisTick }} />
                    <Area type="monotone" dataKey="airTemp" name="Air" stroke={CHART_COLORS.airTemp} fill={CHART_COLORS.airTemp} fillOpacity={0.2} unit="°C" />
                    <Area type="monotone" dataKey="waterTemp" name="Eau" stroke={CHART_COLORS.waterTemp} fill={CHART_COLORS.waterTemp} fillOpacity={0.2} unit="°C" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-4 space-y-2 min-w-0">
              <h4 className="text-xs font-semibold text-abyss-200">Vent et rafales (km/h)</h4>
              <div className="h-[200px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="time" tick={{ fill: CHART_THEME.axisTick, fontSize: 10 }} />
                    <YAxis tick={{ fill: CHART_THEME.axisTick, fontSize: 10 }} unit="km/h" />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: CHART_THEME.axisTick }} />
                    <Line type="monotone" dataKey="windSpeed" name="Vent" stroke={CHART_COLORS.wind} strokeWidth={2} dot={false} unit="km/h" />
                    <Line type="monotone" dataKey="windGusts" name="Rafales" stroke={CHART_COLORS.gusts} strokeWidth={1.5} strokeDasharray="3 3" dot={false} unit="km/h" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
