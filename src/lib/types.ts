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
  source_url: string | null;
  source_checked_at: string | null;
  lat: number | null;
  lng: number | null;
  stage: string | null;
  founded_year: number | null;
  open_roles_count?: number;
}

export interface JobPosting {
  id: string;
  entity_id: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  source_url: string;
  first_seen_at: string;
  last_checked_at: string;
  expires_at: string;
}

export interface FundingLead {
  lead_key: string;
  company_name: string;
  headline: string;
  source_url: string | null;
  source_name: string | null;
  source_published_at: string | null;
  review_reason: string | null;
}
