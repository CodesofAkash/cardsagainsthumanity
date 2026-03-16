import { HeroSkeleton, ProductCardSkeleton } from "@/components/Skeletons";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ paddingTop: 72 }}>
      <HeroSkeleton />
      <section className="related-products" style={{ background: "#000" }}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6 h-8 w-48 rounded bg-white/10 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
