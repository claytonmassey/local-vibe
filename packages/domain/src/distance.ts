const EARTH_MILES = 3958.8;

export function haversineMiles(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(EARTH_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** Approximate centroid used for the founding fixture. Not a surveyed boundary. */
export const ZIP_77354_CENTROID = { lat: 30.2094, lng: -95.7508 };
