"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressMealImage } from "@/lib/compressImage";
import { createMeal } from "@/lib/actions/meals";
import { MEAL_IMAGES_BUCKET } from "@/lib/types";

const MEAL_LABELS = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function MealForm({
  weekId,
  startDate,
  dayOfWeek,
}: {
  weekId: string;
  startDate: string;
  dayOfWeek: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "compressing" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setLabel("");
    setNote("");
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Add a photo first.");
      return;
    }

    setError(null);
    try {
      setStatus("compressing");
      const compressed = await compressMealImage(file);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const mealId = crypto.randomUUID();
      const imagePath = `${user.id}/${weekId}/${mealId}.jpg`;

      setStatus("uploading");
      const { error: uploadError } = await supabase.storage
        .from(MEAL_IMAGES_BUCKET)
        .upload(imagePath, compressed, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      await createMeal({
        id: mealId,
        weekId,
        startDate,
        dayOfWeek,
        label: label || null,
        note: note.trim() || null,
        imagePath,
      });

      reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  const busy = status === "compressing" || status === "uploading";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-3">
        <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-2xl text-neutral-400 dark:bg-neutral-800">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected meal" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>📷</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {MEAL_LABELS.map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLabel(l === label ? "" : l)}
                className={`rounded-full border px-2.5 py-1 text-xs ${
                  label === l
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!file || busy}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "compressing"
          ? "Compressing…"
          : status === "uploading"
            ? "Uploading…"
            : "Add meal"}
      </button>
    </form>
  );
}
