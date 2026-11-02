import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [speed, setSpeed] = useState(null);
  const [heading, setHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [trail, setTrail] = useState([]);
  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed: spd, heading: hdg, accuracy: acc } = pos.coords;
        const newPos = { lat: latitude, lng: longitude, timestamp: pos.timestamp };
        
        setPosition(newPos);
        setAccuracy(acc);
        
        if (spd !== null && spd !== undefined) {
          setSpeed(spd);
        } else if (lastPositionRef.current) {
          const dt = (pos.timestamp - lastPositionRef.current.timestamp) / 1000;
          if (dt > 0) {
            const R = 6371000;
            const dLat = (latitude - lastPositionRef.current.lat) * Math.PI / 180;
            const dLon = (longitude - lastPositionRef.current.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lastPositionRef.current.lat*Math.PI/180)*Math.cos(latitude*Math.PI/180)*Math.sin(dLon/2)**2;
            const d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            setSpeed(d / dt);
          }
        }
        
        if (hdg !== null) setHeading(hdg);
        lastPositionRef.current = newPos;
        
        setTrail(prev => {
          const next = [...prev, newPos];
          return next.length > 500 ? next.slice(-500) : next;
        });
      },
      (err) => {
        switch (err.code) {
          case 1:
            setError('Accès à la position refusé. Autorisez la géolocalisation.');
            break;
          case 2:
            setError('Position indisponible. Vérifiez votre GPS.');
            break;
          case 3:
            setError('Délai d\'attente GPS dépassé.');
            break;
          default:
            setError('Erreur de géolocalisation inconnue.');
        }
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const clearTrail = useCallback(() => {
    setTrail([]);
  }, []);

  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(p);
          setAccuracy(pos.coords.accuracy);
          resolve(p);
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    error,
    isTracking,
    speed,
    heading,
    accuracy,
    trail,
    startTracking,
    stopTracking,
    getPosition,
    clearTrail,
    speedKnots: speed !== null ? speed * 1.94384 : null,
  };
}
