export type GeocodeResult =
  | { coordinates: { longitude: number; latitude: number } }
  | { warning: string };

export function geocodeArea(
  area: string | null,
  city: string,
): Promise<GeocodeResult>;
