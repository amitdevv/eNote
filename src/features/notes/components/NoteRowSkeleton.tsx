export function NoteRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 w-[45%] rounded bg-surface-muted" />
        <div className="h-3 w-[70%] rounded bg-surface-muted/60" />
      </div>
      <div className="h-3 w-12 rounded bg-surface-muted" />
    </div>
  );
}

export function NotesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-line-subtle">
      {Array.from({ length: count }).map((_, i) => (
        <NoteRowSkeleton key={i} />
      ))}
    </div>
  );
}
