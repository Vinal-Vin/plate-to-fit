"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Week } from "@/lib/types";

/** Fetches the week row for the given start date, creating an empty one if it doesn't exist yet. */
export async function getOrCreateWeek(startDate: string): Promise<Week> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing, error: selectError } = await supabase
    .from("weeks")
    .select("*")
    .eq("user_id", user.id)
    .eq("start_date", startDate)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing;

  const { data: created, error: insertError } = await supabase
    .from("weeks")
    .insert({ user_id: user.id, start_date: startDate })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created;
}

export async function setGoal(
  weekId: string,
  startDate: string,
  goalPreset: string | null,
  goalNote: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("weeks")
    .update({ goal_preset: goalPreset, goal_note: goalNote })
    .eq("id", weekId);

  if (error) throw error;
  revalidatePath(`/week/${startDate}`);
}
