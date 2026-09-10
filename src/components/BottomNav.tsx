import Link from "next/link";
import { signOut } from "@/app/login/actions";

export function BottomNav({ weekStart }: { weekStart: string }) {
  return (
    <nav className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white/90 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-2 text-sm">
        <Link
          href={`/week/${weekStart}`}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-neutral-600 dark:text-neutral-300"
        >
          <span aria-hidden>🗓️</span>
          Week
        </Link>
        <a
          href={`/api/export/${weekStart}`}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-neutral-600 dark:text-neutral-300"
        >
          <span aria-hidden>📄</span>
          Export
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-neutral-600 dark:text-neutral-300"
          >
            <span aria-hidden>🚪</span>
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
