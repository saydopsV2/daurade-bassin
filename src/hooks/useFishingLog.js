import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'daurade_fishing_log';
const FAVORITES_KEY = 'daurade_favorite_spots';

function loadFromStorage(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Erreur de sauvegarde localStorage:', e);
  }
}

export function useFishingLog() {
  const [entries, setEntries] = useState(() => loadFromStorage(STORAGE_KEY));

  useEffect(() => {
    saveToStorage(STORAGE_KEY, entries);
  }, [entries]);

  const addEntry = useCallback((entry) => {
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const removeEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearAll };
}

export function useFavoriteSpots() {
  const [favorites, setFavorites] = useState(() => loadFromStorage(FAVORITES_KEY));

  useEffect(() => {
    saveToStorage(FAVORITES_KEY, favorites);
  }, [favorites]);

  const addFavorite = useCallback((spot) => {
    const newSpot = {
      id: 'custom-' + Date.now().toString(36),
      name: spot.name || 'Mon Spot Secret',
      lat: spot.lat,
      lng: spot.lng,
      type: 'favori',
      subType: 'GPS Perso',
      description: spot.description || 'Spot enregistré manuellement',
      timestamp: new Date().toISOString(),
      icon: '📍',
      exposure: { sheltered_from: [], exposed_to: [], windThreshold: 20 },
      bottom: spot.bottom || 'Non renseigné',
      idealTide: spot.idealTide || 'Non renseigné',
      baits: spot.baits || [],
      sinkerRange: [80, 120],
      species: ['Royale', 'Grise'],
    };
    setFavorites(prev => [newSpot, ...prev]);
    return newSpot;
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => prev.filter(s => s.id !== id));
  }, []);

  return { favorites, addFavorite, removeFavorite };
}
