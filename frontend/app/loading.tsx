import { CartItemSkeleton, HeroSkeleton, ListSkeleton, ProductCardSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="h-8 w-32 rounded bg-white/10 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-10 rounded bg-white/10 animate-pulse" />
        </div>
      </header>

      <HeroSkeleton />

      <section className="bg-black px-6 pb-12">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-12 text-black">
        <h2 className="mb-6 text-2xl font-black">People also buy</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/10 bg-black/5 p-4">
              <CartItemSkeleton />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black px-6 py-12">
        <h2 className="mb-4 text-2xl font-black">Your questions</h2>
        <ListSkeleton rows={5} />
      </section>
    </div>
  );
}
