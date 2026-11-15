'use client';
import dynamic from 'next/dynamic';

export const StaticMapLoader = dynamic(() => import('./StaticMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f4f3f4] animate-pulse rounded-[12px]" />
  ),
});