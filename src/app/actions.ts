"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { geocodeArea } from "@/lib/nominatim.mjs";
import { slugify } from "@/lib/utils";

const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value));

const entityIdSchema = z.string().uuid();
const fundingLeadKeySchema = z.string().regex(/^[0-9a-f]{64}$/i);

const submitSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(5),
  city: z.string().min(2),
  area: z.string().optional(),
  entity_type: z.enum(["startup", "vc"]),
  founders: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  source_url: httpUrlSchema,
});

export async function submitStartup(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const parsed = submitSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const {
    name,
    tagline,
    city,
    area,
    entity_type,
    founders,
    website_url,
    source_url,
  } = parsed.data;
  const slug = slugify(name);
  const founderArray = founders
    ? founders.split(",").map((f) => f.trim())
    : null;

  const supabase = await createClient();

  const { error } = await supabase.from("entities").insert({
    name,
    slug,
    tagline,
    city,
    area: area || null,
    entity_type,
    founders: founderArray,
    website_url: website_url || null,
    source_url,
    tags: [],
    is_verified: false,
    pin_precision: "area_level",
    lat: null,
    lng: null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A listing with this name already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/map");
  return { success: true };
}

export async function requestAdminSignIn(formData: FormData) {
  const parsedEmail = z.string().email().safeParse(formData.get("email"));
  if (!parsedEmail.success) {
    return { error: "Enter a valid email address." };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return { error: "Admin sign-in is not configured on this deployment." };
  }

  const email = parsedEmail.data.trim().toLowerCase();
  if (email !== adminEmail) {
    return {
      success:
        "If this email is authorized, a sign-in link will be sent shortly.",
    };
  }

  const requestHeaders = await headers();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestHeaders.get("origin");
  if (!siteUrl) {
    return { error: "Unable to determine the site URL for sign-in." };
  }

  let emailRedirectTo: string;
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { error: "The configured site URL must use HTTP or HTTPS." };
    }
    url.pathname = "/auth/callback";
    url.search = "";
    emailRedirectTo = url.toString();
  } catch {
    return { error: "The configured site URL is invalid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: `Unable to send the sign-in link: ${error.message}` };
  }

  return {
    success:
      "If this email is authorized, a sign-in link will be sent shortly.",
  };
}

async function requireAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return { error: "Admin access is not configured." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || data.user?.email?.toLowerCase() !== adminEmail) {
    return { error: "You are not authorized to moderate listings." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: "Server-side admin database access is not configured.",
    };
  }

  const adminDatabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { supabase, adminDatabase };
}

export async function approveEntity(id: string, sourceUrl: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid listing ID." };

  const parsedUrl = httpUrlSchema.safeParse(sourceUrl);
  if (!parsedUrl.success) {
    return { error: "Add a valid source URL before verifying this listing." };
  }

  const { data: entity, error: lookupError } = await auth.adminDatabase
    .from("entities")
    .select("area,city,lat,lng")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (lookupError) return { error: lookupError.message };
  if (!entity) return { error: "Listing not found; no changes were saved." };

  const updates: {
    is_verified: boolean;
    source_url: string;
    source_checked_at: string;
    lat?: number;
    lng?: number;
    pin_precision?: "precise" | "area_level";
  } = {
    is_verified: true,
    source_url: parsedUrl.data,
    source_checked_at: new Date().toISOString(),
  };
  let warning: string | undefined;

  if (entity.lat == null || entity.lng == null) {
    const geocoded = await geocodeArea(entity.area, entity.city);
    updates.pin_precision = "area_level";
    if ("warning" in geocoded) {
      warning = `Source saved, but no map pin was set. ${geocoded.warning}`;
    } else {
      updates.lng = geocoded.coordinates.longitude;
      updates.lat = geocoded.coordinates.latitude;
    }
  }

  const { data, error } = await auth.adminDatabase
    .from("entities")
    .update(updates)
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Listing not found; no changes were saved." };

  revalidatePath("/map");
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, warning };
}

export async function deleteEntity(id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const parsedId = entityIdSchema.safeParse(id);
  if (!parsedId.success) return { error: "Invalid listing ID." };

  const { data, error } = await auth.adminDatabase
    .from("entities")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Listing not found; no changes were saved." };

  revalidatePath("/map");
  revalidatePath("/admin");
  return { success: true };
}

export async function ignoreFundingLead(leadKey: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;

  const parsedKey = fundingLeadKeySchema.safeParse(leadKey);
  if (!parsedKey.success) return { error: "Invalid funding lead ID." };

  const { data, error } = await auth.adminDatabase
    .from("funding_leads")
    .update({
      status: "ignored",
      review_reason: "Dismissed by admin.",
      updated_at: new Date().toISOString(),
    })
    .eq("lead_key", parsedKey.data)
    .eq("status", "needs_review")
    .select("lead_key")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) {
    return { error: "Funding lead not found or no longer awaiting review." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function signOutAdmin() {
  const auth = await requireAdmin();
  if ("error" in auth) redirect("/admin/login");

  const { error } = await auth.supabase.auth.signOut();
  if (error) {
    throw new Error(`Unable to sign out: ${error.message}`);
  }

  redirect("/admin/login");
}
