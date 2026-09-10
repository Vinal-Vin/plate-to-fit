import type { SupabaseClient } from "@supabase/supabase-js";
import { MEAL_IMAGES_BUCKET } from "@/lib/types";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function signedMealImageUrl(
  supabase: SupabaseClient,
  imagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
  if (error) return null;
  return data.signedUrl;
}

export async function signedMealImageUrls(
  supabase: SupabaseClient,
  imagePaths: string[]
): Promise<Record<string, string>> {
  if (imagePaths.length === 0) return {};
  const { data, error } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .createSignedUrls(imagePaths, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const entry of data) {
    if (entry.signedUrl && entry.path) map[entry.path] = entry.signedUrl;
  }
  return map;
}
