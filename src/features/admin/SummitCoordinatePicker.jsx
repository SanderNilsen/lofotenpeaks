import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { Crosshair } from 'lucide-react';
import { useRef } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const DEFAULT_CENTER = [68.2, 13.8];
const summitMarkerIcon = divIcon({
  className: 'summit-coordinate-marker',
  html: '<span></span>',
  iconAnchor: [12, 12],
  iconSize: [24, 24],
});

const Picker = styled.div`
  display: grid;
  gap: 10px;
  grid-column: 1 / -1;
`;

const PickerHeader = styled.div`
  display: grid;
  gap: 4px;

  strong {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.82rem;
    line-height: 1.45;
    margin: 0;
  }
`;

const MapShell = styled.div`
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  height: 360px;
  min-width: 0;
  overflow: hidden;
  position: relative;

  .leaflet-container {
    cursor: crosshair;
    height: 100%;
    width: 100%;
  }

  .summit-coordinate-marker span {
    background: ${theme.colors.warning};
    border: 3px solid ${theme.colors.surface};
    border-radius: 50%;
    box-shadow: 0 1px 5px rgba(48, 48, 50, 0.45);
    display: block;
    height: 24px;
    width: 24px;
  }

  ${({ $disabled }) =>
    $disabled &&
    `
      opacity: 0.65;
      pointer-events: none;
    `}

  @media (max-width: 640px) {
    height: 300px;
  }
`;

const CenterTarget = styled(Crosshair)`
  color: ${theme.colors.ink};
  filter: drop-shadow(0 0 2px ${theme.colors.surface});
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 500;
`;

const RadiusLabel = styled.span`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  bottom: 12px;
  color: ${theme.colors.ink};
  font-size: 0.78rem;
  font-weight: 800;
  left: 12px;
  padding: 7px 9px;
  pointer-events: none;
  position: absolute;
  z-index: 500;
`;

const PickerFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  justify-content: space-between;
`;

const CoordinateReadout = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin: 0;

  div {
    display: flex;
    gap: 6px;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 800;
  }

  dd {
    color: ${theme.colors.ink};
    font-size: 0.78rem;
    font-variant-numeric: tabular-nums;
    margin: 0;
  }
`;

const CenterButton = styled.button`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 7px;
  min-height: 42px;
  padding: 8px 11px;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.forest};
    color: ${theme.colors.forest};
  }

  &:focus-visible {
    outline: 3px solid rgba(36, 95, 130, 0.25);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

function toCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function MapClickHandler({ disabled, onSelect }) {
  useMapEvents({
    click(event) {
      if (!disabled) {
        onSelect(event.latlng);
      }
    },
  });

  return null;
}

export function SummitCoordinatePicker({
  disabled = false,
  latitude,
  longitude,
  onChange,
  radiusMeters = 200,
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lat = toCoordinate(latitude);
  const lng = toCoordinate(longitude);
  const hasSelection = lat !== null && lng !== null;
  const position = hasSelection ? [lat, lng] : null;
  const center = position ?? DEFAULT_CENTER;
  const parsedRadius = Number(radiusMeters);
  const visibleRadius = Number.isFinite(parsedRadius) && parsedRadius > 0 ? parsedRadius : 200;

  function selectCoordinates({ lat: nextLat, lng: nextLng }) {
    onChange({
      lat: Number(nextLat).toFixed(6),
      lng: Number(nextLng).toFixed(6),
    });
  }

  function selectMapCenter() {
    const mapCenter = mapRef.current?.getCenter();

    if (mapCenter) {
      selectCoordinates(mapCenter);
    }
  }

  return (
    <Picker>
      <PickerHeader>
        <strong>Summit location</strong>
        <p>Click the summit on the map, drag the marker to adjust it, or use the map centre point.</p>
      </PickerHeader>
      <MapShell $disabled={disabled} role="region" aria-label="Choose the mountain summit location">
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={hasSelection ? 13 : 8}
          scrollWheelZoom={false}
          aria-label="Interactive summit coordinate picker"
        >
          <MapClickHandler disabled={disabled} onSelect={selectCoordinates} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <Circle
              center={position}
              pathOptions={{
                color: theme.colors.forest,
                fillColor: theme.colors.forest,
                fillOpacity: 0.14,
                opacity: 0.9,
                weight: 2,
              }}
              radius={visibleRadius}
            />
          )}
          {position && (
            <Marker
              ref={markerRef}
              alt="Selected summit location"
              draggable={!disabled}
              icon={summitMarkerIcon}
              position={position}
              eventHandlers={{
                dragend() {
                  const markerPosition = markerRef.current?.getLatLng();

                  if (markerPosition) {
                    selectCoordinates(markerPosition);
                  }
                },
              }}
            />
          )}
        </MapContainer>
        <CenterTarget aria-hidden="true" size={28} strokeWidth={2.5} />
        {position && <RadiusLabel>{visibleRadius} m check-in radius</RadiusLabel>}
      </MapShell>
      <PickerFooter>
        <CoordinateReadout aria-live="polite">
          <div>
            <dt>Latitude</dt>
            <dd>{hasSelection ? lat.toFixed(6) : 'Not selected'}</dd>
          </div>
          <div>
            <dt>Longitude</dt>
            <dd>{hasSelection ? lng.toFixed(6) : 'Not selected'}</dd>
          </div>
        </CoordinateReadout>
        <CenterButton disabled={disabled} type="button" onClick={selectMapCenter}>
          <Crosshair aria-hidden="true" size={17} />
          Use map centre
        </CenterButton>
      </PickerFooter>
    </Picker>
  );
}
