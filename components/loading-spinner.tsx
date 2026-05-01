export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}
