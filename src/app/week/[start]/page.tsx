import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWeek } from "@/lib/actions/weeks";
import { signedMealImageUrls } from "@/lib/storage";
import {
  DAY_NAMES,
  addWeeks,
  currentWeekStart,
  formatDate,
  formatWeekRange,
  mondayOf,
  weekDates,
} from "@/lib/week";
import type { Meal } from "@/lib/types";
import { DayCard } from "@/components/DayCard";
import { WeekGoalSection } from "@/components/WeekGoalSection";
import { BottomNav } from "@/components/BottomNav";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function WeekPage({
  params,
}: {
  params: Promise<{ start: string }>;
}) {
  const { start } = await params;

  if (!DATE_RE.test(start)) redirect(`/week/${currentWeekStart()}`);

  const monday = mondayOf(new Date(`${start}T00:00:00`));
  if (monday !== start) redirect(`/week/${monday}`);

  const week = await getOrCreateWeek(start);

  const supabase = await createClient();
  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("week_id", week.id)
    .order("created_at", { ascending: true });

  const mealsByDay = new Map<number, Meal[]>();
  for (const meal of (meals ?? []) as Meal[]) {
    const list = mealsByDay.get(meal.day_of_week) ?? [];
    list.push(meal);
    mealsByDay.set(meal.day_of_week, list);
  }

  const imagePaths = (meals ?? []).map((m) => m.image_path);
  const imageUrls = await signedMealImageUrls(supabase, imagePaths);

  const dates = weekDates(start);
  const today = formatDate(new Date());
  const prevWeek = addWeeks(start, -1);
  const nextWeek = addWeeks(start, 1);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-[calc(env(safe-area-inset-top)_+_1.5rem)]">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/week/${prevWeek}`}
            className="rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:active:bg-neutral-800"
            aria-label="Previous week"
          >
            ‹
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {formatWeekRange(start)}
            </h1>
            {start !== currentWeekStart() && (
              <Link href={`/week/${currentWeekStart()}`} className="text-xs text-emerald-700 dark:text-emerald-400">
                Back to this week
              </Link>
            )}
          </div>
          <Link
            href={`/week/${nextWeek}`}
            className="rounded-full p-2 text-neutral-500 active:bg-neutral-100 dark:active:bg-neutral-800"
            aria-label="Next week"
          >
            ›
          </Link>
        </div>

        <div className="mb-4">
          <WeekGoalSection
            weekId={week.id}
            startDate={start}
            goalPreset={week.goal_preset}
            goalNote={week.goal_note}
          />
        </div>

        <div className="space-y-2">
          {dates.map((dateStr, i) => (
            <DayCard
              key={dateStr}
              startDate={start}
              dateStr={dateStr}
              dayName={DAY_NAMES[i]}
              meals={mealsByDay.get(i) ?? []}
              imageUrls={imageUrls}
              isToday={dateStr === today}
            />
          ))}
        </div>
      </main>
      <BottomNav weekStart={start} />
    </div>
  );
}
