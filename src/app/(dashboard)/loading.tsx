import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Stat cards row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/50 bg-card p-6 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-1 w-full rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[280px] w-full rounded" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/50 bg-card p-6 space-y-4"
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-[180px] w-full rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full rounded" />
            <Skeleton className="h-9 w-full rounded" />
          </div>
          <div className="rounded-lg border border-border/50 bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
