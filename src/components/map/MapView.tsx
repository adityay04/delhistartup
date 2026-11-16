"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/store/mapStore";
import type { Entity } from "@/lib/types";
import { useTheme } from "next-themes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapView({ entities }: { entities: Entity[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { selectedId, select } = useMapStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: ref.current,
      style:
        resolvedTheme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      center: [77.209, 28.6139],
      zoom: 10,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("entities", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "entities",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": resolvedTheme === "dark" ? "#fafafa" : "#141314",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color":
            resolvedTheme === "dark" ? "#141314" : "#ffffff",
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
        paint: {
          "text-color": resolvedTheme === "dark" ? "#141314" : "#ffffff",
        },
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
            resolvedTheme === "dark" ? "#fafafa" : "#141314",
            "startup",
            "#2563eb",
            "#6b7280",
          ],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color":
            resolvedTheme === "dark" ? "#141314" : "#ffffff",
        },
      });

      map.on("click", "unclustered", (e) => {
        if (!e.features || !e.features[0]) return;
        const feature = e.features[0];
        if (feature.properties && feature.properties.id) {
          select(feature.properties.id);
        }
      });

      map.on("mouseenter", "unclustered", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered", () => {
        map.getCanvas().style.cursor = "";
      });

      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [select, resolvedTheme]);

  useEffect(() => {
    if (!mapLoaded) return;
    const src = mapRef.current?.getSource("entities") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (!src) return;

    const features = entities
      .filter((e) => e.lng != null && e.lat != null)
      .map((e) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [e.lng!, e.lat!],
        },
        properties: { id: e.id, name: e.name, type: e.entity_type },
      }));

    src.setData({
      type: "FeatureCollection",
      features,
    });
  }, [entities, mapLoaded]);

  useEffect(() => {
    if (!selectedId || !mapLoaded) return;
    const e = entities.find((x) => x.id === selectedId);
    if (e?.lng != null && e?.lat != null) {
      mapRef.current?.flyTo({
        center: [e.lng, e.lat],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [selectedId, entities, mapLoaded]);

  return <div ref={ref} className="h-full w-full" />;
}
