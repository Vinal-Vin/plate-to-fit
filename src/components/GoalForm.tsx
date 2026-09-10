"use client";

import { useState, useTransition } from "react";
import { setGoal } from "@/lib/actions/weeks";
import { GOAL_PRESETS } from "@/lib/week";

export function GoalForm({
  weekId,
  startDate,
  initialPreset,
  initialNote,
  onClose,
}: {
  weekId: string;
  startDate: string;
  initialPreset: string | null;
  initialNote: string | null;
  onClose: () => void;
}) {
  const [preset, setPreset] = useState(initialPreset ?? "");
  const [note, setNote] = useState(initialNote ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await setGoal(weekId, startDate, preset || null, note.trim() || null);
      onClose();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Goal for this week
        </label>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => setPreset(p.value === preset ? "" : p.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                preset === p.value
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="goal-note" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Notes (optional)
        </label>
        <textarea
          id="goal-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. focus on core work 3x this week"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900"
        >
          {pending ? "Saving…" : "Save goal"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
