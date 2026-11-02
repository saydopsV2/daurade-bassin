import { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER = [44.68, -1.16];
const ZOOM = 11;

const BASEMAPS = {
  osm: {
    id: 'osm',
    label: 'Marin (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abc',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite (Bancs/Parcs)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar, IGN',
    maxZoom: 18,
  },
  dark: {
    id: 'dark',
    label: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OSM',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

function getScoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function createSpotIcon(spot, score) {
  const color = getScoreColor(score);
  const html = `
    <div style="
      display: flex;
      align-items: center;
      gap: 4px;
      background: ${color};
      color: #fff;
      border-radius: 9999px;
      padding: 3px 8px 3px 6px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0,0,0,0.5);
      border: 2px solid rgba(255,255,255,0.85);
      transform: translate(-50%, -50%);
      cursor: pointer;
    ">
      <span style="font-size: 15px; line-height: 1;">${spot.icon || '🐟'}</span>
      <span>${score ?? '–'}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-spot-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createUserIcon() {
  const html = `
    <div class="gps-marker">
      <div class="gps-marker-dot"></div>
      <div class="gps-marker-ring"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function MapController({ flyTo, userPosition, recenterTrigger }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const t3 = setTimeout(() => map.invalidateSize(), 1000);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    let ro = null;
    const container = map.getContainer();
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, 14, { duration: 1.2 });
    }
  }, [flyTo, map]);

  useEffect(() => {
    if (recenterTrigger && userPosition) {
      map.flyTo([userPosition.lat, userPosition.lng], 15, { duration: 1 });
    }
  }, [recenterTrigger, userPosition, map]);

  return null;
}

function MapView({
  spots = [],
  selectedSpot,
  onSelectSpot,
  userPosition,
  userAccuracy,
  trail = [],
  filter = 'all',
  scores = {},
}) {
  const [flyTo, setFlyTo] = useState(null);
  const [recenterCount, setRecenterCount] = useState(0);
  const [activeBasemap, setActiveBasemap] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const userIcon = useMemo(() => createUserIcon(), []);

  const filteredSpots = useMemo(() => {
    if (!spots) return [];
    if (filter === 'all') return spots;
    if (filter === 'bord') return spots.filter((s) => s.type === 'bord');
    if (filter === 'bateau') return spots.filter((s) => s.type === 'bateau');
    if (filter === 'favori') return spots.filter((s) => s.favori || s.type === 'favori');
    return spots;
  }, [spots, filter]);

  useEffect(() => {
    if (selectedSpot) {
      setFlyTo([selectedSpot.lat, selectedSpot.lng]);
    }
  }, [selectedSpot]);

  const handleLocateClick = () => {
    if (userPosition) {
      setRecenterCount((c) => c + 1);
    } else {
      alert("En attente de votre signal GPS... Vérifiez que la géolocalisation est autorisée sur votre navigateur.");
    }
  };

  const trailPositions = useMemo(() => {
    if (!trail || trail.length === 0) return [];
    return trail.map((p) => [p.lat, p.lng]);
  }, [trail]);

  const currentLayer = BASEMAPS[activeBasemap] || BASEMAPS.osm;

  return (
    <div className="relative w-full h-full min-h-0 bg-abyss-950 flex flex-col flex-1">
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        className="w-full h-full flex-1"
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          key={activeBasemap}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
          subdomains={currentLayer.subdomains || 'abc'}
          maxZoom={currentLayer.maxZoom || 19}
        />

        <MapController
          flyTo={flyTo}
          userPosition={userPosition}
          recenterTrigger={recenterCount}
        />

        <ZoomControl position="bottomright" />

        {filteredSpots.map((spot) => {
          const scoreObj = scores[spot.id];
          const score =
            typeof scoreObj === 'object' && scoreObj !== null
              ? scoreObj.total
              : scoreObj ?? spot.score ?? 50;
          const icon = createSpotIcon(spot, score);

          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSpot && onSelectSpot(spot),
              }}
            >
              <Popup className="dark-popup">
                <div className="text-sm p-1">
                  <p className="font-bold text-base mb-1 text-white flex items-center gap-1.5">
                    <span>{spot.icon || '🐟'}</span>
                    <span>{spot.name}</span>
                  </p>
                  <p className="mb-2">
                    <span className="text-xs text-abyss-200">Score Dorade : </span>
                    <span
                      style={{ color: getScoreColor(score) }}
                      className="font-bold text-sm"
                    >
                      {score ?? '–'}/100
                    </span>
                  </p>
                  {spot.description && (
                    <p className="text-xs text-gray-300 mb-2">{spot.description}</p>
                  )}
                  <button
                    onClick={() => onSelectSpot && onSelectSpot(spot)}
                    className="w-full py-1.5 px-3 bg-abyss-600 hover:bg-abyss-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                  >
                    Voir la fiche spot →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userPosition && (
          <>
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="text-xs font-semibold text-white">
                  📍 Votre position GPS
                  {userAccuracy && (
                    <p className="font-normal text-[10px] text-abyss-300">
                      Précision : ± {Math.round(userAccuracy)} m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {userAccuracy && userAccuracy < 1000 && (
              <Circle
                center={[userPosition.lat, userPosition.lng]}
                radius={userAccuracy}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              />
            )}
          </>
        )}

        {trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions}
            pathOptions={{
              color: '#38bdf8',
              opacity: 0.8,
              weight: 3.5,
              dashArray: '6, 6',
            }}
          />
        )}
      </MapContainer>

      <div className="absolute top-16 right-3 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-abyss-900/90 hover:bg-abyss-800 text-gray-200 border border-abyss-600/60 shadow-xl text-xs font-medium backdrop-blur-md transition-all active:scale-95"
            title="Changer le fond de carte"
          >
            <Layers size={14} className="text-abyss-300" />
            <span className="hidden sm:inline">{currentLayer.label}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-10 bg-abyss-900/95 border border-abyss-600 rounded-xl shadow-2xl p-1.5 min-w-[170px] backdrop-blur-lg flex flex-col gap-1 animate-fade-in z-[1001]">
              <span className="text-[10px] font-bold text-abyss-400 uppercase tracking-wider px-2 py-1">
                Fonds de carte
              </span>
              {Object.values(BASEMAPS).map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveBasemap(layer.id);
                    setShowLayerMenu(false);
                  }}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                    activeBasemap === layer.id
                      ? 'bg-abyss-600 text-white font-semibold'
                      : 'text-gray-300 hover:bg-abyss-800'
                  }`}
                >
                  <span>{layer.label}</span>
                  {activeBasemap === layer.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleLocateClick}
        className="absolute bottom-20 right-3 z-[1000] flex h-11 w-11 items-center justify-center rounded-xl bg-abyss-800/90 border border-abyss-500/50 text-white shadow-2xl hover:bg-abyss-700 active:scale-90 transition-all backdrop-blur-md"
        title="Centrer sur ma position GPS"
        aria-label="Centrer sur ma position GPS"
      >
        <Crosshair size={22} className={userPosition ? 'text-blue-400' : 'text-gray-400'} />
      </button>
    </div>
  );
}

export default MapView;
