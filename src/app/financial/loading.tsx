export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted/60 rounded-lg mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-2xl h-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-8 h-[500px]" />
        <div className="bg-card border border-border rounded-2xl p-8 h-[500px]" />
      </div>
    </div>
  )
}
