export function LoadScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-zinc-300">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-400"
        aria-hidden
      />
      <p className="m-0 text-sm font-medium tracking-wide">Loading…</p>
    </div>
  );
}
