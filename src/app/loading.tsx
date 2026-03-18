export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-card border border-border rounded-2xl shadow-xl">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Wait a moment...
        </p>
      </div>
    </div>
  )
}
