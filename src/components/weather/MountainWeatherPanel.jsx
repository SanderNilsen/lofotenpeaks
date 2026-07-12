import {
  AlertTriangle,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  ExternalLink,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import styled from 'styled-components';
import { weatherLocations } from '../../data/weatherLocations.js';
import { theme } from '../../styles/theme.js';

const Section = styled.section`
  margin: ${({ $compact }) => ($compact ? '0' : '0 0 34px')};
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: flex-start;
  margin-bottom: 14px;

  h2 {
    font-size: ${({ $compact }) => ($compact ? '1.2rem' : 'clamp(1.45rem, 3vw, 2rem)')};
    line-height: 1.1;
    margin: 0;
  }

  @media (max-width: 680px) {
    align-items: start;
    flex-direction: column;
    gap: 8px;
  }
`;

const SourceLink = styled.a`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-size: ${({ $compact }) => ($compact ? '0.82rem' : '0.92rem')};
  font-weight: 800;
  gap: 6px;
  line-height: 1;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: ${({ $compact }) => ($compact ? '1fr' : 'repeat(3, minmax(0, 1fr))')};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 16px;
  padding: 16px;
`;

const CardTop = styled.div`
  align-items: start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
`;

const Location = styled.div`
  display: grid;
  gap: 4px;

  h3 {
    font-size: 1.2rem;
    margin: 0;
  }

  span {
    color: ${theme.colors.muted};
    font-weight: 700;
  }
`;

const Condition = styled.div`
  align-items: center;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
`;

const Temperature = styled.strong`
  font-size: 2rem;
  line-height: 1;
`;

const Metrics = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: ${({ $compact }) => ($compact ? '1fr' : 'repeat(2, minmax(0, 1fr))')};

  div {
    align-items: start;
    display: grid;
    gap: 8px;
    grid-template-columns: 18px minmax(0, 1fr);
  }

  small {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    display: block;
    font-weight: 800;
    margin-top: 2px;
  }
`;

const Notice = styled.div`
  align-items: center;
  background: #f2e6dc;
  border: 1px solid #dfc4af;
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.warning};
  display: flex;
  font-weight: 800;
  font-size: ${({ $compact }) => ($compact ? '0.92rem' : '1rem')};
  gap: 8px;
  margin-top: 12px;
  padding: 12px 14px;
`;

const Status = styled.div`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  display: flex;
  font-weight: 800;
  gap: 8px;
  padding: 16px;
`;

const LastUpdated = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.92rem;
  margin: 12px 0 0;
`;

const weatherCodeMap = {
  0: { label: 'Clear', icon: Sun },
  1: { label: 'Mostly clear', icon: CloudSun },
  2: { label: 'Partly cloudy', icon: CloudSun },
  3: { label: 'Overcast', icon: Cloud },
  45: { label: 'Fog', icon: CloudFog },
  48: { label: 'Rime fog', icon: CloudFog },
  51: { label: 'Light drizzle', icon: CloudRain },
  53: { label: 'Drizzle', icon: CloudRain },
  55: { label: 'Heavy drizzle', icon: CloudRain },
  56: { label: 'Freezing drizzle', icon: CloudSnow },
  57: { label: 'Freezing drizzle', icon: CloudSnow },
  61: { label: 'Light rain', icon: CloudRain },
  63: { label: 'Rain', icon: CloudRain },
  65: { label: 'Heavy rain', icon: CloudRain },
  66: { label: 'Freezing rain', icon: CloudSnow },
  67: { label: 'Freezing rain', icon: CloudSnow },
  71: { label: 'Light snow', icon: CloudSnow },
  73: { label: 'Snow', icon: CloudSnow },
  75: { label: 'Heavy snow', icon: CloudSnow },
  77: { label: 'Snow grains', icon: CloudSnow },
  80: { label: 'Rain showers', icon: CloudRain },
  81: { label: 'Rain showers', icon: CloudRain },
  82: { label: 'Heavy showers', icon: CloudRain },
  85: { label: 'Snow showers', icon: CloudSnow },
  86: { label: 'Snow showers', icon: CloudSnow },
  95: { label: 'Thunderstorm', icon: CloudLightning },
  96: { label: 'Thunderstorm', icon: CloudLightning },
  99: { label: 'Thunderstorm', icon: CloudLightning },
};

function formatNumber(value, maximumFractionDigits = 0) {
  if (typeof value !== 'number') {
    return '-';
  }

  return value.toLocaleString('en', { maximumFractionDigits });
}

function getWeatherDescription(code) {
  return weatherCodeMap[code] ?? { label: 'Weather update', icon: Cloud };
}

function buildWeatherUrl(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    timezone: 'Europe/Oslo',
    wind_speed_unit: 'ms',
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchLocationWeather(location, signal) {
  const response = await fetch(buildWeatherUrl(location), { signal });

  if (!response.ok) {
    throw new Error(`Weather request failed for ${location.name}`);
  }

  const data = await response.json();

  return {
    ...location,
    current: data.current,
    currentUnits: data.current_units,
  };
}

export function MountainWeatherPanel({
  title = 'Lofoten Weather',
  locationIds,
  locations,
  compact = false,
  showNotice = true,
}) {
  const [weather, setWeather] = useState([]);
  const [status, setStatus] = useState('loading');
  const [updatedAt, setUpdatedAt] = useState(null);
  const headingId = useId();
  const locationIdsKey = (locationIds ?? []).join('|');
  const customLocationsKey = (locations ?? [])
    .map((location) => `${location.id}:${location.latitude}:${location.longitude}`)
    .join('|');
  const selectedLocations = useMemo(() => {
    if (locations?.length) {
      return locations;
    }

    if (!locationIdsKey) {
      return weatherLocations;
    }

    const selectedIds = new Set(locationIdsKey.split('|'));
    return weatherLocations.filter((location) => selectedIds.has(location.id));
  }, [customLocationsKey, locationIdsKey, locations]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      if (selectedLocations.length === 0) {
        setWeather([]);
        setUpdatedAt(null);
        setStatus('empty');
        return;
      }

      setStatus('loading');

      try {
        const weatherData = await Promise.all(
          selectedLocations.map((location) => fetchLocationWeather(location, controller.signal)),
        );

        setWeather(weatherData);
        setUpdatedAt(new Date());
        setStatus('ready');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setStatus('error');
        }
      }
    }

    loadWeather();

    return () => controller.abort();
  }, [selectedLocations]);

  const updatedLabel = useMemo(() => {
    if (!updatedAt) {
      return null;
    }

    return updatedAt.toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Oslo',
    });
  }, [updatedAt]);

  return (
    <Section $compact={compact} aria-labelledby={headingId}>
      <Header $compact={compact}>
        <h2 id={headingId}>{title}</h2>
        <SourceLink $compact={compact} href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo <ExternalLink size={14} aria-hidden="true" />
        </SourceLink>
      </Header>

      {status === 'loading' && (
        <Status>
          <RefreshCw size={18} aria-hidden="true" /> Loading current weather
        </Status>
      )}

      {status === 'error' && (
        <Status>
          <AlertTriangle size={18} aria-hidden="true" /> Weather is unavailable right now
        </Status>
      )}

      {status === 'empty' && (
        <Status>
          <AlertTriangle size={18} aria-hidden="true" /> Weather location is not set yet
        </Status>
      )}

      {status === 'ready' && (
        <>
          <Grid $compact={compact}>
            {weather.map((location) => {
              const condition = getWeatherDescription(location.current.weather_code);
              const ConditionIcon = condition.icon;
              const currentUnit = location.currentUnits.temperature_2m;
              const windUnit = location.currentUnits.wind_speed_10m;
              const precipitationUnit = location.currentUnits.precipitation;

              return (
                <Card key={location.id}>
                  <CardTop>
                    <Location>
                      <h3>{location.name}</h3>
                      {location.area && <span>{location.area}</span>}
                    </Location>
                    <Temperature>
                      {formatNumber(location.current.temperature_2m)}
                      {currentUnit}
                    </Temperature>
                  </CardTop>

                  <Condition>
                    <ConditionIcon size={20} aria-hidden="true" /> {condition.label}
                  </Condition>

                  <Metrics $compact={compact}>
                    <div>
                      <Thermometer size={17} aria-hidden="true" />
                      <span>
                        <small>Feels like</small>
                        <strong>
                          {formatNumber(location.current.apparent_temperature)}
                          {currentUnit}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Wind size={17} aria-hidden="true" />
                      <span>
                        <small>Wind</small>
                        <strong>
                          {formatNumber(location.current.wind_speed_10m, 1)} {windUnit}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Wind size={17} aria-hidden="true" />
                      <span>
                        <small>Gusts</small>
                        <strong>
                          {formatNumber(location.current.wind_gusts_10m, 1)} {windUnit}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <Droplets size={17} aria-hidden="true" />
                      <span>
                        <small>Rain now</small>
                        <strong>
                          {formatNumber(location.current.precipitation, 1)} {precipitationUnit}
                        </strong>
                      </span>
                    </div>
                  </Metrics>
                </Card>
              );
            })}
          </Grid>
          {showNotice && (
            <Notice $compact={compact}>
              <AlertTriangle size={18} aria-hidden="true" /> Mountain weather changes quickly. Check local forecasts before hiking.
            </Notice>
          )}
          {updatedLabel && <LastUpdated>Updated {updatedLabel} Norway time</LastUpdated>}
        </>
      )}
    </Section>
  );
}
