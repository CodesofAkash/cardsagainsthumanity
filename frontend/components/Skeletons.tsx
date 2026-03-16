"use client";

import React from "react";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-white/10 animate-pulse ${className ?? ""}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white shadow-xl">
      <div className="h-64 w-full rounded-xl bg-white/10" />
      <div className="mt-4 space-y-3">
        <SkeletonBlock className="h-6 w-3/4 rounded" />
        <SkeletonBlock className="h-4 w-1/2 rounded" />
        <SkeletonBlock className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b-2 border-gray-400/70 py-4">
      <SkeletonBlock className="h-20 w-20 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-3/4 rounded" />
        <SkeletonBlock className="h-4 w-1/2 rounded" />
        <SkeletonBlock className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonBlock className="h-6 w-12 rounded" />
    </div>
  );
}

export function ListSkeleton({ rows = 4, light = false }: { rows?: number; light?: boolean }) {
  const tone = light ? "bg-black/10" : "bg-white/10";
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`rounded-lg ${tone} animate-pulse`} style={{ height: 64 }} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-black text-white" style={{ paddingTop: 72 }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-2">
        <SkeletonBlock className="h-[360px] w-full rounded-2xl" />
        <div className="space-y-4">
          <SkeletonBlock className="h-10 w-3/4 rounded" />
          <SkeletonBlock className="h-6 w-1/2 rounded" />
          <SkeletonBlock className="h-6 w-2/3 rounded" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
