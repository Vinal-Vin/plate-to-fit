export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-semibold">You’re offline</h1>
      <p className="max-w-xs text-sm text-neutral-500">
        PlateToFit needs a connection to load or save your meals. Reconnect and try again.
      </p>
    </main>
  );
}
