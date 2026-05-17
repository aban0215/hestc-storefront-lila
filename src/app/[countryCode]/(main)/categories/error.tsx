"use client"

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <h1 className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-4">
        Something went wrong
      </h1>
      <p className="text-xs text-gray-500 mb-8 text-center max-w-md">
        We couldn&apos;t load this category. Please try again.
      </p>
      <button
        onClick={reset}
        className="text-xs uppercase tracking-widest px-6 py-3 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
