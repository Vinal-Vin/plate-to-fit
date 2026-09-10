"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MEAL_IMAGES_BUCKET } from "@/lib/types";

export async function createMeal(input: {
  id: string;
  weekId: string;
  startDate: string;
  dayOfWeek: number;
  label: string | null;
  note: string | null;
  imagePath: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("meals").insert({
    id: input.id,
    week_id: input.weekId,
    user_id: user.id,
    day_of_week: input.dayOfWeek,
    label: input.label,
    note: input.note,
    image_path: input.imagePath,
  });

  if (error) throw error;
  revalidatePath(`/week/${input.startDate}`);
  revalidatePath(`/week/${input.startDate}/day/${input.dayOfWeek}`);
}

export async function updateMeal(
  mealId: string,
  startDate: string,
  dayOfWeek: number,
  label: string | null,
  note: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meals")
    .update({ label, note })
    .eq("id", mealId);

  if (error) throw error;
  revalidatePath(`/week/${startDate}`);
  revalidatePath(`/week/${startDate}/day/${dayOfWeek}`);
}

export async function deleteMeal(
  mealId: string,
  imagePath: string,
  startDate: string,
  dayOfWeek: number
) {
  const supabase = await createClient();
  const { error: storageError } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .remove([imagePath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("meals").delete().eq("id", mealId);
  if (error) throw error;

  revalidatePath(`/week/${startDate}`);
  revalidatePath(`/week/${startDate}/day/${dayOfWeek}`);
}
