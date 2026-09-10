export interface Week {
  id: string;
  user_id: string;
  start_date: string;
  goal_preset: string | null;
  goal_note: string | null;
  created_at: string;
}

export interface Meal {
  id: string;
  week_id: string;
  user_id: string;
  day_of_week: number;
  label: string | null;
  note: string | null;
  image_path: string;
  created_at: string;
}

export const MEAL_IMAGES_BUCKET = "meal-images";
