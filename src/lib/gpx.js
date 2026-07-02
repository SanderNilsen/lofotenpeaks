export function parseGpxToLineString(gpxText) {
  const document = new DOMParser().parseFromString(gpxText, 'application/xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    throw new Error('The GPX file could not be parsed. Check that it is a valid .gpx file.');
  }

  const trackPoints = [...document.querySelectorAll('trkpt')];
  const routePoints = [...document.querySelectorAll('rtept')];
  const points = trackPoints.length > 0 ? trackPoints : routePoints;

  if (points.length < 2) {
    throw new Error('The GPX file needs at least two track or route points.');
  }

  const coordinates = points.map((point) => {
    const lat = Number(point.getAttribute('lat'));
    const lng = Number(point.getAttribute('lon'));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('The GPX file contains a route point without valid latitude or longitude.');
    }

    return [lng, lat];
  });

  return {
    type: 'LineString',
    coordinates,
  };
}

export function getRoutePointCount(routeGeoJson) {
  return Array.isArray(routeGeoJson?.coordinates) ? routeGeoJson.coordinates.length : 0;
}
