"use client";

import { useState } from "react";
import { GoalForm } from "@/components/GoalForm";
import { goalPresetLabel } from "@/lib/week";

export function WeekGoalSection({
  weekId,
  startDate,
  goalPreset,
  goalNote,
}: {
  weekId: string;
  startDate: string;
  goalPreset: string | null;
  goalNote: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const hasGoal = Boolean(goalPreset || goalNote);

  if (editing) {
    return (
      <GoalForm
        weekId={weekId}
        startDate={startDate}
        initialPreset={goalPreset}
        initialNote={goalNote}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          This week&rsquo;s goal
        </p>
        {hasGoal ? (
          <>
            {goalPreset && (
              <p className="mt-0.5 truncate text-base font-semibold text-neutral-900 dark:text-neutral-50">
                {goalPresetLabel(goalPreset)}
              </p>
            )}
            {goalNote && (
              <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{goalNote}</p>
            )}
          </>
        ) : (
          <p className="mt-0.5 text-sm text-neutral-500">No goal set yet</p>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
      >
        {hasGoal ? "Edit" : "Set goal"}
      </button>
    </div>
  );
}
