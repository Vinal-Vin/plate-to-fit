import Link from "next/link";
import type { Meal } from "@/lib/types";

export function DayCard({
  startDate,
  dateStr,
  dayName,
  meals,
  imageUrls,
  isToday,
}: {
  startDate: string;
  dateStr: string;
  dayName: string;
  meals: Meal[];
  imageUrls: Record<string, string>;
  isToday: boolean;
}) {
  const thumbs = meals.slice(0, 3);

  return (
    <Link
      href={`/week/${startDate}/day/${dateStr}`}
      className={`flex items-center gap-3 rounded-2xl border p-3 transition active:scale-[0.99] ${
        isToday
          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <div className="w-14 shrink-0 text-center">
        <p className="text-xs font-medium uppercase text-neutral-500">{dayName.slice(0, 3)}</p>
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {Number(dateStr.slice(-2))}
        </p>
      </div>

      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {thumbs.length === 0 ? (
          <p className="text-sm text-neutral-400">No meals logged</p>
        ) : (
          <>
            {thumbs.map((meal) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={meal.id}
                src={imageUrls[meal.image_path]}
                alt={meal.label ?? "Meal"}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ))}
            {meals.length > 3 && (
              <span className="text-xs text-neutral-500">+{meals.length - 3}</span>
            )}
          </>
        )}
      </div>

      <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
        ›
      </span>
    </Link>
  );
}
