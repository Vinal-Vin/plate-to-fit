"use client";

import { useState, useTransition } from "react";
import { deleteMeal, updateMeal } from "@/lib/actions/meals";
import type { Meal } from "@/lib/types";

export function MealCard({
  meal,
  imageUrl,
  startDate,
}: {
  meal: Meal;
  imageUrl: string | undefined;
  startDate: string;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(meal.label ?? "");
  const [note, setNote] = useState(meal.note ?? "");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateMeal(meal.id, startDate, meal.day_of_week, label || null, note.trim() || null);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm("Delete this meal entry?")) return;
    startTransition(async () => {
      await deleteMeal(meal.id, meal.image_path, startDate, meal.day_of_week);
    });
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={meal.label ?? "Meal"}
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      )}

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="space-y-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={pending}
                className="rounded-lg bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="truncate font-medium text-neutral-900 dark:text-neutral-50">
              {meal.label || "Meal"}
            </p>
            {meal.note && (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{meal.note}</p>
            )}
            <div className="mt-2 flex gap-3 text-xs">
              <button onClick={() => setEditing(true)} className="text-neutral-500 underline">
                Edit
              </button>
              <button onClick={handleDelete} disabled={pending} className="text-red-600 underline disabled:opacity-60">
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
