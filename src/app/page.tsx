import { redirect } from "next/navigation";
import { currentWeekStart } from "@/lib/week";

export default function Home() {
  redirect(`/week/${currentWeekStart()}`);
}
