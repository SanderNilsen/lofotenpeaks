export function formatDistance(kilometers) {
  return `${kilometers.toLocaleString('en', { maximumFractionDigits: 1 })} km`;
}

export function formatElevation(meters) {
  return `${meters.toLocaleString('en')} m`;
}

export function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
