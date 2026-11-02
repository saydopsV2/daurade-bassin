import { useState, useEffect, useCallback, useRef } from 'react';
import { FALLBACK_WEATHER, FALLBACK_MARINE } from '../data/spots.js';

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';
const CACHE_KEY_WEATHER = 'daurade_weather_cache';
const CACHE_KEY_MARINE = 'daurade_marine_cache';
const CACHE_DURATION = 15 * 60 * 1000;

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
  } catch {}
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export function useWeatherAPI(lat = 44.66, lng = -1.16) {
  const [weather, setWeather] = useState(null);
  const [marine, setMarine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const abortRef = useRef(null);

  const fetchData = useCallback(async (latitude, longitude) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setUsingFallback(false);

    const cachedWeather = getCached(CACHE_KEY_WEATHER);
    const cachedMarine = getCached(CACHE_KEY_MARINE);
    if (cachedWeather && cachedMarine) {
      setWeather(cachedWeather);
      setMarine(cachedMarine);
      setLoading(false);
    }

    try {
      const weatherUrl = `${WEATHER_BASE}?latitude=${latitude}&longitude=${longitude}`
        + `&current=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation`
        + `&hourly=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,precipitation`
        + `&daily=sunrise,sunset`
        + `&timezone=Europe%2FParis&forecast_days=7`;

      const marineUrl = `${MARINE_BASE}?latitude=${latitude}&longitude=${longitude}`
        + `&current=wave_height,wave_direction,wave_period,sea_surface_temperature,ocean_current_velocity`
        + `&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature,ocean_current_velocity,sea_level_height_msl`
        + `&timezone=Europe%2FParis&forecast_days=7`;

      const [weatherRes, marineRes] = await Promise.all([
        fetch(weatherUrl, { signal: controller.signal }),
        fetch(marineUrl, { signal: controller.signal }),
      ]);

      if (!weatherRes.ok || !marineRes.ok) {
        throw new Error('Erreur API Open-Meteo');
      }

      const weatherData = await weatherRes.json();
      const marineData = await marineRes.json();

      setWeather(weatherData);
      setMarine(marineData);
      setCache(CACHE_KEY_WEATHER, weatherData);
      setCache(CACHE_KEY_MARINE, marineData);
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.warn('Erreur API, utilisation des données de secours:', err.message);
      setError(err.message);
      
      if (!weather && !cachedWeather) {
        setWeather(FALLBACK_WEATHER);
        setUsingFallback(true);
      }
      if (!marine && !cachedMarine) {
        setMarine(FALLBACK_MARINE);
        setUsingFallback(true);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(lat, lng);
    const interval = setInterval(() => fetchData(lat, lng), CACHE_DURATION);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [lat, lng, fetchData]);

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY_WEATHER);
    localStorage.removeItem(CACHE_KEY_MARINE);
    fetchData(lat, lng);
  }, [lat, lng, fetchData]);

  return {
    weather,
    marine,
    loading,
    error,
    usingFallback,
    refresh,
    currentWeather: weather?.current || FALLBACK_WEATHER.current,
    currentMarine: marine?.current || FALLBACK_MARINE.current,
    hourlyWeather: weather?.hourly,
    hourlyMarine: marine?.hourly,
    dailyWeather: weather?.daily,
  };
}
