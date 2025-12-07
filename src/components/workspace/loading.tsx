// /app/(app)/home/loading.tsx
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="h-16 border-b border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] animate-pulse" />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Skeleton */}
        <div className="h-48 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-[rgb(var(--os-surface))] rounded-xl animate-pulse" />
          ))}
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="h-32 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
        
        {/* Two Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
            <div className="h-64 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-8">
            <div className="h-64 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
            <div className="h-64 bg-[rgb(var(--os-surface))] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}