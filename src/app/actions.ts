"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const submitSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(5),
  city: z.string().min(2),
  area: z.string().optional(),
  entity_type: z.enum(["startup", "vc"]),
  founders: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
});

export async function submitStartup(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const parsed = submitSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  const { name, tagline, city, area, entity_type, founders, website_url } =
    parsed.data;
  const slug = slugify(name);
  const founderArray = founders
    ? founders.split(",").map((f) => f.trim())
    : null;

  const lat = 28.6139 + (Math.random() - 0.5) * 0.2;
  const lng = 77.209 + (Math.random() - 0.5) * 0.2;

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
    tags: [],
    is_verified: false,
    pin_precision: "area_level",
    lat,
    lng,
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

export async function approveEntity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("entities")
    .update({ is_verified: true })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/map");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteEntity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("entities").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/map");
  revalidatePath("/admin");
  return { success: true };
}
