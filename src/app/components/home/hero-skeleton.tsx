export default function HeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-900 h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-6 text-center">
        <div className="h-6 bg-gray-700 rounded w-48" />
        <div className="h-12 bg-gray-700 rounded w-96 max-w-[90vw]" />
        <div className="h-4 bg-gray-700 rounded w-32" />
      </div>
    </section>
  )
}
