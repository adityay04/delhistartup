"use client";
import dynamic from "next/dynamic";

export const StaticMapLoader = dynamic(() => import("./StaticMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#f4f3f4] dark:bg-[#141314] animate-pulse rounded-[12px]" />
  ),
});
