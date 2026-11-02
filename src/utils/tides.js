/**
 * Calculateur et estimateur de marées pour le Bassin d'Arcachon (Jetée d'Eyrac)
 */

const REFERENCE_EPOCH = new Date('2026-11-02T11:09:00+01:00').getTime();
const LUNAR_TIDAL_PERIOD_HOURS = 12.4206;

export function getEstimatedTideForDate(date = new Date()) {
  const targetTime = date.getTime();
  const diffHours = (targetTime - REFERENCE_EPOCH) / (1000 * 3600);
  const cycles = diffHours / LUNAR_TIDAL_PERIOD_HOURS;
  const cycleFloor = Math.floor(cycles);

  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 3600 * 1000;

  const highTides = [];
  for (let k = cycleFloor - 2; k <= cycleFloor + 3; k++) {
    const tideTimestamp = REFERENCE_EPOCH + k * LUNAR_TIDAL_PERIOD_HOURS * 3600 * 1000;
    if (tideTimestamp >= startOfDay - 3600 * 1000 && tideTimestamp <= endOfDay + 3600 * 1000) {
      const tideDate = new Date(tideTimestamp);
      highTides.push({
        time: tideDate,
        hourDecimal: tideDate.getHours() + tideDate.getMinutes() / 60,
        formatted: `${String(tideDate.getHours()).padStart(2, '0')}h${String(tideDate.getMinutes()).padStart(2, '0')}`,
      });
    }
  }

  const daysSinceRef = diffHours / 24;
  const springNeapPhase = (daysSinceRef / 14.765) * 2 * Math.PI;
  const approxCoeff = Math.round(75 - 28 * Math.cos(springNeapPhase));
  const clampedCoeff = Math.max(30, Math.min(115, approxCoeff));

  const nowDecimal = date.getHours() + date.getMinutes() / 60;
  let nearestHighTide = highTides[0]?.hourDecimal ?? 11.15;
  let minDiff = 999;
  for (const ht of highTides) {
    const d = Math.abs(ht.hourDecimal - nowDecimal);
    if (d < minDiff) {
      minDiff = d;
      nearestHighTide = ht.hourDecimal;
    }
  }

  return {
    highTides,
    nearestHighTide,
    coefficient: clampedCoeff,
    referenceStation: "Arcachon (Jetée d'Eyrac)",
  };
}

export function extractTidesFromSeaLevel(hourlyTimes, hourlySeaLevels) {
  if (!hourlyTimes || !hourlySeaLevels || hourlySeaLevels.length < 5) return null;

  const peaks = [];
  for (let i = 1; i < hourlySeaLevels.length - 1; i++) {
    const prev = hourlySeaLevels[i - 1];
    const curr = hourlySeaLevels[i];
    const next = hourlySeaLevels[i + 1];

    if (curr > prev && curr > next && curr > 0.1) {
      const d = new Date(hourlyTimes[i]);
      peaks.push({
        time: d,
        hourDecimal: d.getHours() + d.getMinutes() / 60,
        height: curr,
        formatted: `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`,
      });
    }
  }
  return peaks;
}
