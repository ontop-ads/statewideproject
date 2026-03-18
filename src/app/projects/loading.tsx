export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-80 bg-muted/60 rounded-lg mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl h-48" />
        ))}
      </div>
    </div>
  )
}
