// Spots de pêche pré-enregistrés du Bassin d'Arcachon
// Chaque spot contient ses coordonnées exactes, son type de pêche, son exposition,
// la nature du fond, et les recommandations de pêche.

export const SPOTS = [
  {
    id: 'petit-nice',
    name: 'Blockhaus du Petit Nice',
    lat: 44.5628,
    lng: -1.2405,
    type: 'bord',
    subType: 'Surfcasting',
    description: 'Spot mythique face à l\'océan, idéal pour la dorade royale au surfcasting.',
    exposure: {
      sheltered_from: ['E', 'NE'],
      exposed_to: ['W', 'NW', 'SW'],
      windThreshold: 20, // nœuds
    },
    bottom: 'Sable fin, bancs de sable, fosses entre les baïnes',
    idealTide: 'Montante (2h avant PM) à pleine mer',
    baits: ['Ver américain', 'Crabe vert', 'Couteau', 'Bibi'],
    sinkerRange: [100, 170],
    tips: 'Pêcher dans les fosses entre les baïnes. Attention au courant latéral de baïne.',
    species: ['Royale', 'Grise'],
    icon: '🏖️',
  },
  {
    id: 'eyrac',
    name: 'Jetée d\'Eyrac',
    lat: 44.6615,
    lng: -1.1635,
    type: 'bord',
    subType: 'Jetée',
    description: 'Jetée emblématique d\'Arcachon, très accessible. Dorade grise toute l\'année, royale en été.',
    exposure: {
      sheltered_from: ['S', 'SE', 'SW'],
      exposed_to: ['N', 'NW', 'W'],
      windThreshold: 25,
    },
    bottom: 'Sable, vase, parcs à huîtres à proximité',
    idealTide: 'Étale de pleine mer et début de descendante',
    baits: ['Crabe vert', 'Crabe mou', 'Mâchoiron', 'Ver américain'],
    sinkerRange: [80, 120],
    tips: 'Lancer à 30-50m vers les parcs. Les dorades viennent chercher les crabes sur les tables.',
    species: ['Grise', 'Royale'],
    icon: '🌉',
  },
  {
    id: 'pointe-chevaux',
    name: 'Pointe aux Chevaux',
    lat: 44.7125,
    lng: -1.2280,
    type: 'bord',
    subType: 'Surfcasting',
    description: 'Pointe sauvage entre Lège et Cap Ferret, courants puissants, gros spécimens.',
    exposure: {
      sheltered_from: ['SE', 'E'],
      exposed_to: ['W', 'NW', 'N'],
      windThreshold: 22,
    },
    bottom: 'Sable, herbiers de zostères, coquillages',
    idealTide: 'Montante (coefficient 50-75)',
    baits: ['Crabe vert', 'Bibi', 'Ver américain'],
    sinkerRange: [100, 150],
    tips: 'Spot sauvage, accès à pied. Les dorades remontent avec le courant de flot.',
    species: ['Royale'],
    icon: '🌊',
  },
  {
    id: 'arguin',
    name: 'Banc d\'Arguin',
    lat: 44.5755,
    lng: -1.2350,
    type: 'bateau',
    subType: 'Mouillage',
    description: 'Banc de sable protégé, eaux cristallines. Zone de nourricerie pour la dorade.',
    exposure: {
      sheltered_from: ['E', 'NE', 'SE'],
      exposed_to: ['W', 'NW', 'SW'],
      windThreshold: 15,
    },
    bottom: 'Sable blanc, herbiers de zostères, coquillages',
    idealTide: 'Étale de basse mer à mi-montante',
    baits: ['Crabe mou', 'Couteau', 'Bibi'],
    sinkerRange: [40, 80],
    tips: 'Mouiller à la bordure des herbiers. Réserve naturelle : respecter la réglementation.',
    species: ['Royale', 'Grise'],
    icon: '🏝️',
  },
  {
    id: 'passes-sud',
    name: 'Les Passes Sud',
    lat: 44.5820,
    lng: -1.2150,
    type: 'bateau',
    subType: 'Dérive',
    description: 'Chenal principal d\'entrée du Bassin. Forts courants, grosses dorades en dérive.',
    exposure: {
      sheltered_from: [],
      exposed_to: ['W', 'NW', 'SW', 'N', 'S'],
      windThreshold: 15,
    },
    bottom: 'Sable, fosses profondes (8-15m), courants violents',
    idealTide: 'Début de montante ou début de descendante (éviter le plein courant)',
    baits: ['Crabe vert', 'Crabe mou', 'Ver américain'],
    sinkerRange: [120, 170],
    tips: 'Dérive contrôlée avec ancre flottante. Zone dangereuse : expérience requise.',
    species: ['Royale'],
    icon: '⚓',
  },
  {
    id: 'ile-oiseaux',
    name: 'Île aux Oiseaux',
    lat: 44.6730,
    lng: -1.2090,
    type: 'bateau',
    subType: 'Mouillage',
    description: 'Cœur du Bassin. Les cabanes tchanquées. Zone riche en dorades grises et royales.',
    exposure: {
      sheltered_from: ['W', 'NW', 'SW'],
      exposed_to: ['E', 'NE', 'SE'],
      windThreshold: 20,
    },
    bottom: 'Vase, herbiers de zostères, parcs à huîtres',
    idealTide: 'Pleine mer et début de descendante',
    baits: ['Crabe vert', 'Mâchoiron', 'Couteau', 'Ver américain'],
    sinkerRange: [60, 100],
    tips: 'Mouiller en bordure des parcs. Les dorades se nourrissent sur les tables à huîtres.',
    species: ['Grise', 'Royale'],
    icon: '🏠',
  },
  {
    id: 'la-vigne',
    name: 'Port de la Vigne',
    lat: 44.6690,
    lng: -1.2465,
    type: 'bord',
    subType: 'Jetée',
    description: 'Petit port abrité du Cap Ferret. Dorades grises régulières autour des pontons.',
    exposure: {
      sheltered_from: ['W', 'NW', 'N', 'SW'],
      exposed_to: ['E', 'SE'],
      windThreshold: 30,
    },
    bottom: 'Sable, vase, coquillages, pieds de pontons',
    idealTide: 'Pleine mer',
    baits: ['Crabe vert', 'Crabe mou', 'Mâchoiron'],
    sinkerRange: [40, 80],
    tips: 'Spot très abrité, parfait par vent d\'ouest. Pêcher le long des pontons.',
    species: ['Grise', 'Royale'],
    icon: '⛵',
  },
  {
    id: 'le-canon',
    name: 'Le Canon',
    lat: 44.6815,
    lng: -1.2370,
    type: 'bord',
    subType: 'Jetée',
    description: 'Village ostréicole typique. Spot abrité avec d\'excellentes dorades grises.',
    exposure: {
      sheltered_from: ['W', 'NW', 'SW', 'N'],
      exposed_to: ['E', 'SE', 'S'],
      windThreshold: 30,
    },
    bottom: 'Vase, coquillages, parcs à huîtres',
    idealTide: 'Mi-montante à pleine mer',
    baits: ['Crabe vert', 'Mâchoiron', 'Ver américain'],
    sinkerRange: [40, 80],
    tips: 'Les dorades grises sont présentes quasi toute l\'année sur les parcs.',
    species: ['Grise'],
    icon: '🦪',
  },
  {
    id: 'mimbeau',
    name: 'Le Mimbeau',
    lat: 44.6355,
    lng: -1.2480,
    type: 'bord',
    subType: 'Surfcasting',
    description: 'Langue de sable au bout du Cap Ferret. Eaux chaudes et peu profondes, idéal pour la royale.',
    exposure: {
      sheltered_from: ['N', 'NE', 'NW'],
      exposed_to: ['S', 'SW', 'SE'],
      windThreshold: 20,
    },
    bottom: 'Sable fin, herbiers de zostères, eau peu profonde',
    idealTide: 'Montante, 1h avant pleine mer',
    baits: ['Crabe mou', 'Couteau', 'Bibi', 'Ver américain'],
    sinkerRange: [60, 100],
    tips: 'Pêche à vue possible en eau claire. Les royales remontent sur le sable chaud.',
    species: ['Royale'],
    icon: '🌅',
  },
  {
    id: 'belisaire',
    name: 'Jetée de Bélisaire',
    lat: 44.6420,
    lng: -1.2485,
    type: 'bord',
    subType: 'Jetée',
    description: 'Grande jetée du Cap Ferret, accès au chenal. Courants modérés à forts.',
    exposure: {
      sheltered_from: ['E', 'NE'],
      exposed_to: ['W', 'NW', 'SW'],
      windThreshold: 22,
    },
    bottom: 'Sable, roches, courant de chenal',
    idealTide: 'Étale de pleine mer',
    baits: ['Crabe vert', 'Bibi', 'Ver américain', 'Couteau'],
    sinkerRange: [80, 140],
    tips: 'Pêcher côté Bassin (est). Les dorades longent la jetée au montant.',
    species: ['Royale', 'Grise'],
    icon: '🚢',
  },
];

// Coordonnées par défaut du Bassin d'Arcachon
export const BASSIN_CENTER = { lat: 44.68, lng: -1.16 };
export const DEFAULT_ZOOM = 11;

// Constantes de l'algorithme
export const WATER_TEMP_OPTIMAL_MIN = 16;
export const WATER_TEMP_OPTIMAL_MAX = 22;
export const WATER_TEMP_PENALTY_BELOW = 13;
export const PRESSURE_OPTIMAL_MIN = 1015;
export const PRESSURE_OPTIMAL_MAX = 1025;
export const COEFF_IDEAL_MIN = 45;
export const COEFF_IDEAL_MAX = 80;
export const COEFF_STRONG_CURRENT = 85;
export const MAILLE_MIN_CM = 23;

export const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function windDegreesToDirection(degrees) {
  const index = Math.round(degrees / 45) % 8;
  return WIND_DIRECTIONS[index];
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function kmToNauticalMiles(km) {
  return km * 0.539957;
}

export function msToKnots(ms) {
  return ms * 1.94384;
}

export function kmhToKnots(kmh) {
  return kmh * 0.539957;
}

export function bearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const la1 = lat1 * Math.PI / 180;
  const la2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export function bearingToCardinal(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export const FALLBACK_WEATHER = {
  current: {
    temperature_2m: 18,
    surface_pressure: 1018,
    wind_speed_10m: 12,
    wind_direction_10m: 270,
    wind_gusts_10m: 20,
    cloud_cover: 40,
    precipitation: 0,
  },
};

export const FALLBACK_MARINE = {
  current: {
    wave_height: 0.8,
    wave_direction: 280,
    wave_period: 8,
    sea_surface_temperature: 18,
    ocean_current_velocity: 0.3,
  },
};
