import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.jsx';
import MapView from './components/MapView.jsx';
import SpotsList from './components/SpotsList.jsx';
import SpotDetail from './components/SpotDetail.jsx';
import WeatherDashboard from './components/WeatherDashboard.jsx';
import FishingLog from './components/FishingLog.jsx';
import TideControl from './components/TideControl.jsx';
import { SPOTS, haversineDistance, bearing } from './data/spots.js';
import { calculateDoradeScore } from './utils/scoring.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import { useWeatherAPI } from './hooks/useWeatherAPI.js';
import { useFishingLog, useFavoriteSpots } from './hooks/useFishingLog.js';
import { PlusCircle, MapPin, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Paramètres de marée calés sur Arcachon (Jetée d'Eyrac) pour aujourd'hui
  // Pleine mer matin: 11h09 (11.15) | Pleine mer soir: 23h41 (23.68) | Coeff: 47
  const [highTideHour, setHighTideHour] = useState(() => {
    const h = new Date().getHours();
    return h >= 17 ? 23.68 : 11.15;
  });
  const [coefficient, setCoefficient] = useState(47);

  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretSpotName, setSecretSpotName] = useState('');
  const [secretSpotNotes, setSecretSpotNotes] = useState('');

  const {
    position,
    isTracking,
    speedKnots,
    accuracy,
    trail,
    startTracking,
    stopTracking,
    clearTrail,
    getPosition,
  } = useGeolocation();

  const weatherCoords = useMemo(() => {
    if (position && position.lat > 44.4 && position.lat < 44.9 && position.lng > -1.5 && position.lng < -0.9) {
      return { lat: position.lat, lng: position.lng };
    }
    return { lat: 44.66, lng: -1.16 };
  }, [position]);

  const {
    weather,
    marine,
    loading: weatherLoading,
    error: weatherError,
    usingFallback,
    refresh: refreshWeather,
    currentWeather,
    currentMarine,
  } = useWeatherAPI(weatherCoords.lat, weatherCoords.lng);

  const { entries, addEntry, removeEntry, clearAll } = useFishingLog();
  const { favorites, addFavorite } = useFavoriteSpots();

  const allSpots = useMemo(() => {
    return [...SPOTS, ...favorites];
  }, [favorites]);

  const scores = useMemo(() => {
    if (!currentWeather && !currentMarine) return {};

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    const sunrise = weather?.daily?.sunrise?.[0];
    const sunset = weather?.daily?.sunset?.[0];

    let hoursFromHT = null;
    if (highTideHour !== null && highTideHour !== undefined) {
      let diff = currentHour - highTideHour;
      while (diff > 6.21) diff -= 12.42;
      while (diff < -6.21) diff += 12.42;
      hoursFromHT = diff;
    }

    const calculated = {};
    allSpots.forEach((spot) => {
      calculated[spot.id] = calculateDoradeScore({
        waterTemp: currentMarine?.sea_surface_temperature,
        windSpeed: currentWeather?.wind_speed_10m,
        windDir: currentWeather?.wind_direction_10m,
        pressure: currentWeather?.surface_pressure,
        currentHour,
        sunrise,
        sunset,
        coefficient,
        hoursFromHighTide: hoursFromHT,
      }, spot);
    });

    return calculated;
  }, [allSpots, currentWeather, currentMarine, weather, highTideHour, coefficient]);

  const selectedSpotMetrics = useMemo(() => {
    if (!selectedSpot || !position) return { distance: null, bearing: null };
    const dist = haversineDistance(position.lat, position.lng, selectedSpot.lat, selectedSpot.lng);
    const brg = bearing(position.lat, position.lng, selectedSpot.lat, selectedSpot.lng);
    return { distance: dist, bearing: brg };
  }, [selectedSpot, position]);

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const handleSaveSecretSpot = () => {
    if (!position) {
      alert("Activez votre GPS pour enregistrer votre position exacte.");
      return;
    }
    const name = secretSpotName.trim() || `Mon Spot Secret #${favorites.length + 1}`;
    addFavorite({
      name,
      lat: position.lat,
      lng: position.lng,
      description: secretSpotNotes.trim() || 'Spot GPS secret enregistré en mer',
      bottom: 'Fosse / Banc de sable',
      idealTide: 'Montante',
      baits: ['Crabe vert', 'Bibi'],
    });
    setSecretSpotName('');
    setSecretSpotNotes('');
    setShowSecretModal(false);
  };

  useEffect(() => {
    getPosition().catch(() => {});
  }, [getPosition]);

  return (
    <div className={`bg-abyss-950 text-gray-100 flex flex-col font-sans select-none ${
      activeTab === 'map' ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh] pb-24 md:pb-8'
    }`}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isTracking={isTracking}
        speedKnots={speedKnots}
        onToggleTracking={handleToggleTracking}
      />

      <main className="flex-1 pt-14 flex flex-col relative overflow-hidden">
        {activeTab === 'map' && (
          <div className="relative flex-1 w-full h-full flex flex-col">
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex bg-abyss-900/90 backdrop-blur-md p-1 rounded-xl border border-abyss-700/60 shadow-xl pointer-events-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-abyss-600 text-white shadow' : 'text-abyss-300 hover:text-white'
                  }`}
                >
                  Tous ({allSpots.length})
                </button>
                <button
                  onClick={() => setFilter('bord')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filter === 'bord' ? 'bg-abyss-600 text-white shadow' : 'text-abyss-300 hover:text-white'
                  }`}
                >
                  Du bord 🏖️
                </button>
                <button
                  onClick={() => setFilter('bateau')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filter === 'bateau' ? 'bg-abyss-600 text-white shadow' : 'text-abyss-300 hover:text-white'
                  }`}
                >
                  Bateau ⛵
                </button>
                <button
                  onClick={() => setFilter('favori')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    filter === 'favori' ? 'bg-abyss-600 text-white shadow' : 'text-abyss-300 hover:text-white'
                  }`}
                >
                  Mes spots 📍 ({favorites.length})
                </button>
              </div>

              <button
                onClick={() => setShowSecretModal(true)}
                className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sable-600/95 hover:bg-sable-500 text-abyss-950 font-bold text-xs shadow-lg shadow-sable-600/20 active:scale-95 transition-all"
              >
                <PlusCircle size={15} />
                <span>+ Spot Secret</span>
              </button>
            </div>

            {isTracking && (
              <div className="absolute top-16 left-3 right-3 z-10 pointer-events-none flex justify-center">
                <div className="pointer-events-auto bg-abyss-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-500/40 shadow-xl flex items-center gap-3 text-xs text-gray-200">
                  <span className="flex items-center gap-1 text-blue-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    Radar Dérive
                  </span>
                  <span className="font-mono text-white">
                    Vitesse : <strong className="text-sable-400">{speedKnots ? speedKnots.toFixed(1) : '0.0'} kn</strong>
                  </span>
                  {trail.length > 1 && (
                    <button
                      onClick={clearTrail}
                      className="text-abyss-400 hover:text-red-400 text-[10px] underline ml-1"
                    >
                      Effacer trace
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 w-full h-full">
              <MapView
                spots={allSpots}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                userPosition={position}
                userAccuracy={accuracy}
                trail={trail}
                filter={filter}
                scores={scores}
              />
            </div>
          </div>
        )}

        {activeTab === 'spots' && (
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
            <TideControl
              highTideHour={highTideHour}
              coefficient={coefficient}
              onHighTideChange={setHighTideHour}
              onCoefficientChange={setCoefficient}
            />

            <SpotsList
              spots={allSpots}
              scores={scores}
              userPosition={position}
              onSelectSpot={(spot) => {
                setSelectedSpot(spot);
                setActiveTab('map');
              }}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>
        )}

        {activeTab === 'meteo' && (
          <div className="flex-1 max-w-5xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
            <TideControl
              highTideHour={highTideHour}
              coefficient={coefficient}
              onHighTideChange={setHighTideHour}
              onCoefficientChange={setCoefficient}
            />

            <WeatherDashboard
              weather={weather}
              marine={marine}
              loading={weatherLoading}
              error={weatherError}
              usingFallback={usingFallback}
              onRefresh={refreshWeather}
            />
          </div>
        )}

        {activeTab === 'carnet' && (
          <div className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
            <FishingLog
              entries={entries}
              onAdd={addEntry}
              onRemove={removeEntry}
              onClear={clearAll}
              userPosition={position}
              currentWeather={currentWeather}
              currentMarine={currentMarine}
            />
          </div>
        )}
      </main>

      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          score={scores[selectedSpot.id]?.total ?? 50}
          scoreBreakdown={scores[selectedSpot.id]?.breakdown}
          weather={currentWeather}
          marine={currentMarine}
          distance={selectedSpotMetrics.distance}
          bearing={selectedSpotMetrics.bearing}
          userPosition={position}
          onClose={() => setSelectedSpot(null)}
          onLogCatch={() => {
            setSelectedSpot(null);
            setActiveTab('carnet');
          }}
        />
      )}

      {showSecretModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-5 space-y-4 border-sable-500/30">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-sable-400 flex items-center gap-2">
                <MapPin size={18} />
                Enregistrer un Spot Secret
              </h3>
              <button
                onClick={() => setShowSecretModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Nom du spot
                </label>
                <input
                  type="text"
                  placeholder="ex: Fosse aux grosses royales"
                  value={secretSpotName}
                  onChange={(e) => setSecretSpotName(e.target.value)}
                  className="w-full bg-abyss-800 border border-abyss-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sable-400"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium block mb-1">
                  Notes de repérage / fond
                </label>
                <textarea
                  rows={2}
                  placeholder="ex: 12m de fond, banc de moules, dérive NE"
                  value={secretSpotNotes}
                  onChange={(e) => setSecretSpotNotes(e.target.value)}
                  className="w-full bg-abyss-800 border border-abyss-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sable-400"
                />
              </div>

              <div className="bg-abyss-800/80 rounded-xl p-3 text-xs space-y-1">
                <p className="text-abyss-300 font-medium">Position GPS actuelle :</p>
                {position ? (
                  <p className="font-mono text-green-400 font-semibold">
                    {position.lat.toFixed(5)}° N, {position.lng.toFixed(5)}° E
                    <span className="text-abyss-400 text-[10px] ml-2">
                      (± {Math.round(accuracy || 5)}m)
                    </span>
                  </p>
                ) : (
                  <p className="text-orange-400">
                    GPS en attente de synchronisation...
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSecretModal(false)}
                className="flex-1 btn-secondary text-xs py-2"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveSecretSpot}
                className="flex-1 btn-accent text-xs py-2"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
