export type EntityType = "startup" | "vc" | "angel_network" | "accelerator";
export type PinPrecision = "precise" | "area_level";

export interface Entity {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  entity_type: EntityType;
  area: string | null;
  city: string;
  pin_precision: PinPrecision;
  founders: string[] | null;
  partners: string[] | null;
  tags: string[];
  website_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  lat: number | null;
  lng: number | null;
}
