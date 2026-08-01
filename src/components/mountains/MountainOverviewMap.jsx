import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatDistance } from '../../lib/formatters.js';
import { theme } from '../../styles/theme.js';

const difficultyColors = {
  easy: '#2f6f5e',
  moderate: '#245f82',
  hard: '#9b5d2e',
  expert: '#743737',
};

const MapRegion = styled.div`
  display: grid;
  gap: 12px;
`;

const Legend = styled.div`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.88rem;
  font-weight: 700;
  gap: 10px 18px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 7px;
  }

  i {
    background: var(--marker-color);
    border: 2px solid ${theme.colors.surface};
    border-radius: 50%;
    box-shadow: 0 0 0 1px ${theme.colors.line};
    height: 12px;
    width: 12px;
  }
`;

const MapFrame = styled.div`
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  height: 510px;
  min-width: 0;
  overflow: hidden;

  .leaflet-container {
    height: 100%;
    width: 100%;
  }

  .leaflet-popup-content {
    margin: 14px;
    min-width: 190px;
  }

  @media (max-width: 640px) {
    height: 430px;
  }
`;

const PopupContent = styled.div`
  display: grid;
  gap: 8px;

  img {
    aspect-ratio: 16 / 9;
    border-radius: ${theme.radii.small};
    object-fit: cover;
    width: 100%;
  }

  strong,
  p {
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.85rem;
    line-height: 1.45;
  }

  a {
    color: ${theme.colors.forest};
    font-weight: 800;
    text-underline-offset: 3px;
  }
`;

const Alternative = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
`;

const EmptyState = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  padding: 24px;
`;

function isPoint(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

function getStartPoint({ mountain, trail }) {
  if (isPoint(trail?.startPoint)) {
    return trail.startPoint.map(Number);
  }

  if (mountain.coordinates) {
    return [Number(mountain.coordinates.lat), Number(mountain.coordinates.lng)];
  }

  return null;
}

function FitOverviewBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 11);
      return;
    }

    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [36, 36] });
    }
  }, [map, positions]);

  return null;
}

function AccessibleHikeMarker({ item, position }) {
  const markerRef = useRef(null);
  const difficulty = item.trail?.difficulty ?? item.mountain.difficulty ?? 'moderate';
  const color = difficultyColors[difficulty] ?? difficultyColors.moderate;

  useEffect(() => {
    const marker = markerRef.current;
    const element = marker?.getElement();

    if (!marker || !element) {
      return undefined;
    }

    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', `${item.mountain.name} map location, ${difficulty} hike`);

    function handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        marker.openPopup();
      }
    }

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [difficulty, item.mountain.name]);

  return (
    <CircleMarker
      ref={markerRef}
      center={position}
      radius={9}
      pathOptions={{ color: '#ffffff', fillColor: color, fillOpacity: 1, weight: 3 }}
    >
      <Popup>
        <PopupContent>
          <img
            src={item.mountain.heroImage.src}
            alt=""
            width="320"
            height="180"
            loading="lazy"
            decoding="async"
          />
          <strong>{item.mountain.name}</strong>
          <p>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            {item.trail ? ` · ${formatDistance(item.trail.lengthKm)} · ${item.trail.estimatedDuration}` : ''}
          </p>
          <p>Marker shows the GPX route start, or the summit when no GPX route is available.</p>
          <Link to={`/mountains/${item.mountain.slug}`}>View hiking guide</Link>
        </PopupContent>
      </Popup>
    </CircleMarker>
  );
}

export default function MountainOverviewMap({ items }) {
  const mappedItems = useMemo(
    () =>
      items
        .map((item) => ({ ...item, position: getStartPoint(item) }))
        .filter((item) => isPoint(item.position)),
    [items],
  );
  const positions = useMemo(() => mappedItems.map((item) => item.position), [mappedItems]);

  if (mappedItems.length === 0) {
    return <EmptyState>No map coordinates are available for these hikes yet.</EmptyState>;
  }

  return (
    <MapRegion aria-label="Map of Lofoten hike locations">
      <Legend aria-label="Map marker difficulty legend">
        {Object.entries(difficultyColors).map(([label, color]) => (
          <span key={label}>
            <i style={{ '--marker-color': color }} aria-hidden="true" />
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </span>
        ))}
      </Legend>
      <MapFrame>
        <MapContainer
          center={positions[0]}
          zoom={9}
          scrollWheelZoom={false}
          aria-label="Interactive map of hike locations"
        >
          <FitOverviewBounds positions={positions} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mappedItems.map((item) => (
            <AccessibleHikeMarker
              key={item.mountain.id}
              item={item}
              position={item.position}
            />
          ))}
        </MapContainer>
      </MapFrame>
      <Alternative>
        The map uses OpenStreetMap tiles. Choose List above for the same hikes in a keyboard-friendly format.
      </Alternative>
    </MapRegion>
  );
}
