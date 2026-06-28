import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
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
`;

export function TrailMap({ trail }) {
  const center = trail.route[Math.floor(trail.route.length / 2)];

  return (
    <MapFrame>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={trail.route} pathOptions={{ color: theme.colors.forest, weight: 5 }} />
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
