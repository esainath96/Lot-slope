export type Coordinate = { lat: number; lng: number; elevation?: number };
export type LotCorners = { nw: Coordinate; ne: Coordinate; sw: Coordinate; se: Coordinate };

export type LotSample = {
  address: string;
  center: Coordinate;
  corners: LotCorners;
  minElevation: number;
  maxElevation: number;
  delta: number;
};

// Simple cache to avoid redundant API calls
const geocodeCache = new Map<string, Coordinate>();
const elevationCache = new Map<string, number>();

export type AddressOption = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const autocompleteCache = new Map<string, AddressOption[]>();

export async function searchAddressOptions(query: string): Promise<AddressOption[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return [];
  if (autocompleteCache.has(normalized)) {
    return autocompleteCache.get(normalized)!;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
  const response = await fetch(url);
  
  if (!response.ok) {
    return []; // Fail silently for autocomplete
  }

  const data = await response.json();
  autocompleteCache.set(normalized, data);
  return data;
}

/**
 * Convert an address to coordinates using Nominatim API.
 */
export async function geocodeAddress(address: string): Promise<Coordinate> {
  const normalizedAddress = address.trim().toLowerCase();
  if (geocodeCache.has(normalizedAddress)) {
    return geocodeCache.get(normalizedAddress)!;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to geocode address');
  }

  const data = await response.json();
  if (data.length === 0) {
    throw new Error('Address not found');
  }

  const coord = {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };

  geocodeCache.set(normalizedAddress, coord);
  return coord;
}

/**
 * Generate a ~20x20m bounding box around a center coordinate.
 * Roughly: 1 degree latitude = 111,111 meters.
 * So 10 meters is approx 0.00009 degrees.
 */
export function generateLotBox(center: Coordinate, radiusMeters: number = 10): LotCorners {
  const latOffset = radiusMeters / 111111;
  // Adjust longitude offset based on latitude (cos(lat))
  const lngOffset = radiusMeters / (111111 * Math.cos((center.lat * Math.PI) / 180));

  return {
    nw: { lat: center.lat + latOffset, lng: center.lng - lngOffset },
    ne: { lat: center.lat + latOffset, lng: center.lng + lngOffset },
    sw: { lat: center.lat - latOffset, lng: center.lng - lngOffset },
    se: { lat: center.lat - latOffset, lng: center.lng + lngOffset },
  };
}

/**
 * Fetch elevation for a list of coordinates using OpenTopoData (mapzen dataset).
 */
export async function fetchElevations(coords: Coordinate[]): Promise<number[]> {
  const uncachedCoords: { index: number; coord: Coordinate }[] = [];
  const results: number[] = new Array(coords.length);

  // Check cache first
  coords.forEach((coord, index) => {
    const key = `${coord.lat.toFixed(5)},${coord.lng.toFixed(5)}`;
    if (elevationCache.has(key)) {
      results[index] = elevationCache.get(key)!;
    } else {
      uncachedCoords.push({ index, coord });
    }
  });

  if (uncachedCoords.length === 0) {
    return results;
  }

  // Fetch uncached
  const locations = uncachedCoords.map(uc => `${uc.coord.lat},${uc.coord.lng}`).join('|');
  const url = `/api/opentopodata/v1/mapzen?locations=${locations}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch elevation data');
  }

  const data = await response.json();
  if (!data.results) {
    throw new Error('Invalid elevation data received');
  }

  data.results.forEach((res: any, i: number) => {
    const ele = res.elevation || 0;
    const uc = uncachedCoords[i];
    results[uc.index] = ele;
    
    // Save to cache
    const key = `${uc.coord.lat.toFixed(5)},${uc.coord.lng.toFixed(5)}`;
    elevationCache.set(key, ele);
  });

  return results;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to reverse geocode');
  }
  const data = await response.json();
  if (!data || !data.display_name) {
    throw new Error('Address not found at this location');
  }
  return data.display_name;
}

export async function processLotFromCoords(address: string, center: Coordinate): Promise<LotSample> {
  const corners = generateLotBox(center);

  const coordsList = [corners.nw, corners.ne, corners.sw, corners.se];
  const elevations = await fetchElevations(coordsList);

  // Convert to feet (1 meter = 3.28084 feet)
  const METERS_TO_FEET = 3.28084;
  corners.nw.elevation = elevations[0] * METERS_TO_FEET;
  corners.ne.elevation = elevations[1] * METERS_TO_FEET;
  corners.sw.elevation = elevations[2] * METERS_TO_FEET;
  corners.se.elevation = elevations[3] * METERS_TO_FEET;

  const minElevation = Math.min(...elevations) * METERS_TO_FEET;
  const maxElevation = Math.max(...elevations) * METERS_TO_FEET;
  const delta = maxElevation - minElevation;

  return {
    address,
    center,
    corners,
    minElevation,
    maxElevation,
    delta,
  };
}

export async function processLot(address: string): Promise<LotSample> {
  const center = await geocodeAddress(address);
  return processLotFromCoords(address, center);
}
