import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWeek } from "@/lib/actions/weeks";
import { signedMealImageUrls } from "@/lib/storage";
import { dayOfWeekFromDate, formatDayHeading, mondayOf } from "@/lib/week";
import type { Meal } from "@/lib/types";
import { MealForm } from "@/components/MealForm";
import { MealCard } from "@/components/MealCard";
import { BottomNav } from "@/components/BottomNav";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DayPage({
  params,
}: {
  params: Promise<{ start: string; date: string }>;
}) {
  const { start, date } = await params;

  if (!DATE_RE.test(start) || !DATE_RE.test(date)) redirect("/");

  const monday = mondayOf(new Date(`${start}T00:00:00`));
  if (monday !== start) redirect(`/week/${monday}/day/${date}`);

  let dayOfWeek: number;
  try {
    dayOfWeek = dayOfWeekFromDate(start, date);
  } catch {
    redirect(`/week/${start}`);
  }

  const week = await getOrCreateWeek(start);

  const supabase = await createClient();
  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("week_id", week.id)
    .eq("day_of_week", dayOfWeek)
    .order("created_at", { ascending: true });

  const typedMeals = (meals ?? []) as Meal[];
  const imageUrls = await signedMealImageUrls(
    supabase,
    typedMeals.map((m) => m.image_path)
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href={`/week/${start}`}
            className="rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:active:bg-neutral-800"
            aria-label="Back to week"
          >
            ‹
          </Link>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {formatDayHeading(date)}
          </h1>
        </div>

        <div className="mb-4">
          <MealForm weekId={week.id} startDate={start} dayOfWeek={dayOfWeek} />
        </div>

        <div className="space-y-3">
          {typedMeals.length === 0 ? (
            <p className="text-center text-sm text-neutral-400">No meals logged for this day yet.</p>
          ) : (
            typedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                imageUrl={imageUrls[meal.image_path]}
                startDate={start}
              />
            ))
          )}
        </div>
      </main>
      <BottomNav weekStart={start} />
    </div>
  );
}
