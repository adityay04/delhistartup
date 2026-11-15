'use client';
import dynamic from 'next/dynamic';

export const MapLoader = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-500">
      Loading map…
    </div>
  ),
});