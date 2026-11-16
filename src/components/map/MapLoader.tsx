"use client";
import dynamic from "next/dynamic";

export const MapLoader = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#f4f3f4] dark:bg-[#141314] text-[#5c5c5c] dark:text-[#71717a]">
      Loading map…
    </div>
  ),
});
