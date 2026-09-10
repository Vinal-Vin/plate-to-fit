import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWeek } from "@/lib/actions/weeks";
import { MEAL_IMAGES_BUCKET } from "@/lib/types";
import type { Meal } from "@/lib/types";
import { DAY_NAMES, formatWeekRange, goalPresetLabel, weekDates } from "@/lib/week";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const IMAGE_SIZE = 130;
const ROW_GAP = 14;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ start: string }> }
) {
  const { start } = await params;
  if (!DATE_RE.test(start)) {
    return NextResponse.json({ error: "Invalid week" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const week = await getOrCreateWeek(start);

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("week_id", week.id)
    .order("day_of_week", { ascending: true })
    .order("created_at", { ascending: true });

  const typedMeals = (meals ?? []) as Meal[];

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(height: number) {
    if (y - height < MARGIN) newPage();
  }

  // Header
  page.drawText("PlateToFit — Weekly Report", {
    x: MARGIN,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.02, 0.35, 0.25),
  });
  y -= 26;
  page.drawText(formatWeekRange(start), { x: MARGIN, y, size: 13, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 20;

  const goalLabel = week.goal_preset ? goalPresetLabel(week.goal_preset) : null;
  if (goalLabel || week.goal_note) {
    page.drawText(`Goal: ${goalLabel ?? ""}`, {
      x: MARGIN,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 16;
    if (week.goal_note) {
      y = drawWrappedText(page, week.goal_note, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 11, font);
    }
  } else {
    page.drawText("Goal: not set", { x: MARGIN, y, size: 12, font, color: rgb(0.4, 0.4, 0.4) });
    y -= 16;
  }
  y -= 10;

  const dates = weekDates(start);

  for (let day = 0; day < 7; day++) {
    const dayMeals = typedMeals.filter((m) => m.day_of_week === day);

    ensureSpace(30);
    page.drawLine({
      start: { x: MARGIN, y: y + 6 },
      end: { x: PAGE_WIDTH - MARGIN, y: y + 6 },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 6;
    page.drawText(`${DAY_NAMES[day]} — ${dates[day]}`, {
      x: MARGIN,
      y,
      size: 14,
      font: fontBold,
      color: rgb(0.02, 0.35, 0.25),
    });
    y -= 22;

    if (dayMeals.length === 0) {
      page.drawText("No meals logged", { x: MARGIN, y, size: 10, font, color: rgb(0.55, 0.55, 0.55) });
      y -= 22;
      continue;
    }

    for (const meal of dayMeals) {
      const rowHeight = IMAGE_SIZE;
      ensureSpace(rowHeight + ROW_GAP);

      const imageBytes = await downloadImage(supabase, meal.image_path);
      const textX = MARGIN + IMAGE_SIZE + 16;
      const textWidth = PAGE_WIDTH - MARGIN - textX;

      if (imageBytes) {
        try {
          const image = await pdfDoc.embedJpg(imageBytes);
          const scale = Math.min(IMAGE_SIZE / image.width, IMAGE_SIZE / image.height);
          const w = image.width * scale;
          const h = image.height * scale;
          page.drawImage(image, {
            x: MARGIN + (IMAGE_SIZE - w) / 2,
            y: y - IMAGE_SIZE + (IMAGE_SIZE - h) / 2,
            width: w,
            height: h,
          });
        } catch {
          page.drawRectangle({
            x: MARGIN,
            y: y - IMAGE_SIZE,
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            color: rgb(0.93, 0.93, 0.93),
          });
        }
      } else {
        page.drawRectangle({
          x: MARGIN,
          y: y - IMAGE_SIZE,
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          color: rgb(0.93, 0.93, 0.93),
        });
      }

      let textY = y - 4;
      page.drawText(meal.label || "Meal", {
        x: textX,
        y: textY,
        size: 12,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
        maxWidth: textWidth,
      });
      textY -= 16;
      if (meal.note) {
        drawWrappedText(page, meal.note, textX, textY, textWidth, 10, font);
      }

      y -= rowHeight + ROW_GAP;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `platetofit-${start}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function downloadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string
): Promise<ArrayBuffer | null> {
  const { data, error } = await supabase.storage.from(MEAL_IMAGES_BUCKET).download(path);
  if (error || !data) return null;
  return data.arrayBuffer();
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  font: PDFFont
): number {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;
  const color = rgb(0.35, 0.35, 0.35);

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size, font, color });
      cursorY -= size + 3;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursorY, size, font, color });
    cursorY -= size + 3;
  }
  return cursorY;
}
