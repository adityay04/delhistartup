"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Entity } from "@/lib/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function StaticMap({ entities }: { entities: Entity[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [77.209, 28.6139],
      zoom: 10,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("entities", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: entities
            .filter((e) => e.lng != null && e.lat != null)
            .map((e) => ({
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [e.lng!, e.lat!],
              },
              properties: { id: e.id, name: e.name, type: e.entity_type },
            })),
        },
        cluster: true,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "entities",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#141314",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "entities",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered",
        type: "circle",
        source: "entities",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match",
            ["get", "type"],
            "vc",
            "#141314",
            "startup",
            "#2563eb",
            "#6b7280",
          ],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "unclustered", (e) => {
        if (!e.features || !e.features[0]) return;
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const name = feature.properties?.name;
        const type = feature.properties?.type === "vc" ? "VC Firm" : "Startup";

        new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setLngLat(coordinates)
          .setHTML(
            `
            <div class="p-2">
              <p class="font-medium text-sm text-[#141314] m-0">${name}</p>
              <p class="text-xs text-[#5c5c5c] mt-0.5 m-0">${type}</p>
            </div>
          `,
          )
          .addTo(map);
      });

      map.on("mouseenter", "unclustered", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [entities]);

  return <div ref={ref} className="h-full w-full" />;
}
