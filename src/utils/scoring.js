/**
 * Algorithme du "Score Dorade" - Indice d'Activité sur 100
 */
import {
  WATER_TEMP_OPTIMAL_MIN, WATER_TEMP_OPTIMAL_MAX, WATER_TEMP_PENALTY_BELOW,
  PRESSURE_OPTIMAL_MIN, PRESSURE_OPTIMAL_MAX,
  COEFF_IDEAL_MIN, COEFF_IDEAL_MAX, COEFF_STRONG_CURRENT,
  windDegreesToDirection,
} from '../data/spots.js';

function scoreWaterTemp(temp) {
  if (temp === null || temp === undefined) return 12;
  if (temp >= WATER_TEMP_OPTIMAL_MIN && temp <= WATER_TEMP_OPTIMAL_MAX) {
    const center = (WATER_TEMP_OPTIMAL_MIN + WATER_TEMP_OPTIMAL_MAX) / 2;
    const dist = Math.abs(temp - center);
    const maxDist = (WATER_TEMP_OPTIMAL_MAX - WATER_TEMP_OPTIMAL_MIN) / 2;
    return 25 - (dist / maxDist) * 5;
  }
  if (temp < WATER_TEMP_PENALTY_BELOW) {
    return Math.max(0, 5 - (WATER_TEMP_PENALTY_BELOW - temp) * 2);
  }
  if (temp < WATER_TEMP_OPTIMAL_MIN) {
    const ratio = (temp - WATER_TEMP_PENALTY_BELOW) / (WATER_TEMP_OPTIMAL_MIN - WATER_TEMP_PENALTY_BELOW);
    return 5 + ratio * 15;
  }
  if (temp > 26) return Math.max(0, 15 - (temp - 26) * 3);
  const ratio = (temp - WATER_TEMP_OPTIMAL_MAX) / 4;
  return 20 - ratio * 5;
}

function scoreWind(windSpeed, windDir, spot) {
  if (windSpeed === null || windSpeed === undefined) return 10;
  
  const dir = windDegreesToDirection(windDir || 0);
  const isExposed = spot.exposure.exposed_to.includes(dir);
  const isSheltered = spot.exposure.sheltered_from.includes(dir);
  
  let score = 20;
  const speedKnots = windSpeed * 0.539957;
  if (speedKnots > 30) score -= 15;
  else if (speedKnots > 25) score -= 10;
  else if (speedKnots > 20) score -= 6;
  else if (speedKnots > 15) score -= 3;
  else if (speedKnots < 5) score -= 2;
  
  if (isExposed && speedKnots > spot.exposure.windThreshold) {
    score -= 8;
  } else if (isExposed && speedKnots > 10) {
    score -= 3;
  } else if (isSheltered) {
    score += 3;
  }
  
  return Math.max(0, Math.min(20, score));
}

function scorePressure(pressure) {
  if (pressure === null || pressure === undefined) return 8;
  if (pressure >= PRESSURE_OPTIMAL_MIN && pressure <= PRESSURE_OPTIMAL_MAX) {
    return 15;
  }
  if (pressure < 1000) return 2;
  if (pressure < PRESSURE_OPTIMAL_MIN) {
    return 2 + ((pressure - 1000) / (PRESSURE_OPTIMAL_MIN - 1000)) * 13;
  }
  if (pressure > 1035) return 5;
  return 15 - ((pressure - PRESSURE_OPTIMAL_MAX) / 10) * 10;
}

function scoreLuminosity(currentHour, sunrise, sunset) {
  if (!sunrise || !sunset) return 8;
  
  const sunriseH = new Date(sunrise).getHours() + new Date(sunrise).getMinutes() / 60;
  const sunsetH = new Date(sunset).getHours() + new Date(sunset).getMinutes() / 60;
  
  const distSunrise = Math.abs(currentHour - sunriseH);
  const distSunset = Math.abs(currentHour - sunsetH);
  const minDist = Math.min(distSunrise, distSunset);
  
  if (minDist <= 0.5) return 15;
  if (minDist <= 1) return 13;
  if (minDist <= 2) return 11;
  if (minDist <= 3) return 8;
  if (currentHour < sunriseH - 1 || currentHour > sunsetH + 1) return 5;
  return 6;
}

function scoreTide(coefficient, hoursFromHighTide) {
  let score = 0;
  if (coefficient !== null && coefficient !== undefined) {
    if (coefficient >= COEFF_IDEAL_MIN && coefficient <= COEFF_IDEAL_MAX) {
      score += 12;
    } else if (coefficient > COEFF_STRONG_CURRENT) {
      score += Math.max(3, 12 - (coefficient - COEFF_STRONG_CURRENT) * 0.8);
    } else if (coefficient > COEFF_IDEAL_MAX) {
      score += 10;
    } else if (coefficient < COEFF_IDEAL_MIN) {
      score += Math.max(4, 12 - (COEFF_IDEAL_MIN - coefficient) * 0.3);
    }
  } else {
    score += 7;
  }
  
  if (hoursFromHighTide !== null && hoursFromHighTide !== undefined) {
    const absHours = Math.abs(hoursFromHighTide);
    if (absHours <= 0.5) {
      score += 13;
    } else if (absHours <= 1.5) {
      score += 11;
    } else if (hoursFromHighTide < 0 && absHours <= 3) {
      score += 12;
    } else if (hoursFromHighTide > 0 && absHours <= 2.5) {
      score += 10;
    } else if (absHours <= 4) {
      score += 7;
    } else if (absHours <= 5) {
      score += 5;
    } else {
      score += 4;
    }
  } else {
    score += 7;
  }
  
  return Math.min(25, score);
}

export function calculateDoradeScore(params, spot) {
  const {
    waterTemp,
    windSpeed,
    windDir,
    pressure,
    currentHour,
    sunrise,
    sunset,
    coefficient,
    hoursFromHighTide,
  } = params;

  const waterScore = scoreWaterTemp(waterTemp);
  const windScore = scoreWind(windSpeed, windDir, spot);
  const pressureScore = scorePressure(pressure);
  const lightScore = scoreLuminosity(currentHour, sunrise, sunset);
  const tideScore = scoreTide(coefficient, hoursFromHighTide);

  const total = Math.round(waterScore + windScore + pressureScore + lightScore + tideScore);

  return {
    total: Math.max(0, Math.min(100, total)),
    breakdown: {
      water: { score: Math.round(waterScore), max: 25, label: 'Température eau' },
      wind: { score: Math.round(windScore), max: 20, label: 'Vent' },
      pressure: { score: Math.round(pressureScore), max: 15, label: 'Pression' },
      light: { score: Math.round(lightScore), max: 15, label: 'Luminosité' },
      tide: { score: Math.round(tideScore), max: 25, label: 'Marée' },
    },
  };
}

export function calculateHourlyScores(hourlyWeather, hourlyMarine, dailyWeather, spot, coefficient, highTideHour) {
  if (!hourlyWeather?.time) return [];
  
  const scores = [];
  const sunrise = dailyWeather?.sunrise?.[0];
  const sunset = dailyWeather?.sunset?.[0];

  for (let i = 0; i < Math.min(hourlyWeather.time.length, 168); i++) {
    const time = hourlyWeather.time[i];
    const hour = new Date(time).getHours() + new Date(time).getMinutes() / 60;
    
    let hoursFromHT = null;
    if (highTideHour !== null && highTideHour !== undefined) {
      let diff = hour - highTideHour;
      while (diff > 6.21) diff -= 12.42;
      while (diff < -6.21) diff += 12.42;
      hoursFromHT = diff;
    }

    const dayIndex = Math.floor(i / 24);
    const sunriseDay = dailyWeather?.sunrise?.[dayIndex] || sunrise;
    const sunsetDay = dailyWeather?.sunset?.[dayIndex] || sunset;

    const result = calculateDoradeScore({
      waterTemp: hourlyMarine?.sea_surface_temperature?.[i] ?? hourlyMarine?.sea_surface_temperature?.[0],
      windSpeed: hourlyWeather.wind_speed_10m?.[i],
      windDir: hourlyWeather.wind_direction_10m?.[i],
      pressure: hourlyWeather.surface_pressure?.[i],
      currentHour: hour,
      sunrise: sunriseDay,
      sunset: sunsetDay,
      coefficient,
      hoursFromHighTide: hoursFromHT,
    }, spot);

    scores.push({
      time,
      hour,
      ...result,
    });
  }

  return scores;
}

export function getScoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function getScoreBadgeClass(score) {
  if (score >= 70) return 'badge-green';
  if (score >= 40) return 'badge-orange';
  return 'badge-red';
}

export function getScoreLabel(score) {
  if (score >= 85) return 'Exceptionnel 🔥';
  if (score >= 70) return 'Très bon 🎣';
  if (score >= 55) return 'Correct 👌';
  if (score >= 40) return 'Moyen 😐';
  if (score >= 25) return 'Faible ⚠️';
  return 'Défavorable ❌';
}
