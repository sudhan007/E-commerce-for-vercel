import { Card } from '@/components/ui/card'

export function OrderCardSkeleton() {
  return (
    <Card className="p-6 border border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-3 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div>
            <div className="h-3 w-24 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>

        {/* Middle column skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-3 w-32 bg-muted rounded mb-2" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="flex flex-col justify-between items-end">
          <div className="text-right">
            <div className="h-3 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-28 bg-muted rounded" />
          </div>
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
        <div className="h-9 w-24 bg-muted rounded" />
        <div className="h-9 w-24 bg-muted rounded" />
      </div>
    </Card>
  )
}
