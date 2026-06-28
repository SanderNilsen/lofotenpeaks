import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const MapFrame = styled.div`
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  height: 420px;
  overflow: hidden;

  .leaflet-container {
    height: 100%;
    width: 100%;
  }

  @media (max-width: 640px) {
    height: 320px;
  }
`;

function FitRouteBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length < 2) {
      return;
    }

    map.fitBounds(positions, {
      padding: [28, 28],
    });
  }, [map, positions]);

  return null;
}

export function TrailMap({ trail }) {
  const route = trail.route?.length ? trail.route : [trail.startPoint, trail.endPoint].filter(Boolean);
  const center = route[Math.floor(route.length / 2)];

  return (
    <MapFrame>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <FitRouteBounds positions={route} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={route} pathOptions={{ color: theme.colors.forest, lineCap: 'round', lineJoin: 'round', weight: 5 }} />
        <CircleMarker center={trail.startPoint} pathOptions={{ color: theme.colors.fjord }} radius={8}>
          <Popup>{trail.name} start</Popup>
        </CircleMarker>
        <CircleMarker center={trail.endPoint} pathOptions={{ color: theme.colors.warning }} radius={8}>
          <Popup>{trail.name} summit</Popup>
        </CircleMarker>
      </MapContainer>
    </MapFrame>
  );
}
