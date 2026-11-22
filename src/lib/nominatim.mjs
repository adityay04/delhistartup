"use strict";

import { z } from "zod";

const nominatimResultsSchema = z.array(
  z.object({
    lat: z.string().regex(/^-?\d+(?:\.\d+)?$/),
    lon: z.string().regex(/^-?\d+(?:\.\d+)?$/),
    category: z.string(),
    type: z.string(),
  }),
);

const ncrAreaTypes = new Set([
  "neighbourhood",
  "suburb",
  "quarter",
  "city_district",
  "district",
  "locality",
  "city",
  "town",
  "village",
  "hamlet",
]);

let nominatimQueue = Promise.resolve();
let lastNominatimRequestAt = 0;

async function fetchNominatim(url) {
  let release = () => {};
  const previousRequest = nominatimQueue;
  nominatimQueue = new Promise((resolve) => {
    release = resolve;
  });
  await previousRequest;

  try {
    const waitMs = Math.max(
      0,
      1000 - (Date.now() - lastNominatimRequestAt),
    );
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    lastNominatimRequestAt = Date.now();
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "DelhiStartupMap/1.0 (+https://github.com/adityay04/delhistartup)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } finally {
    release();
  }
}

async function geocodeArea(area, city) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: [area, city, "India"].filter(Boolean).join(", "),
    format: "jsonv2",
    countrycodes: "in",
    viewbox: "76.3,29.6,78.2,27.7",
    bounded: "1",
    limit: "5",
  }).toString();

  try {
    const response = await fetchNominatim(url);
    if (!response.ok) {
      return {
        warning: `Nominatim geocoding returned HTTP ${response.status}.`,
      };
    }

    const parsedResults = nominatimResultsSchema.safeParse(
      await response.json(),
    );
    if (!parsedResults.success) {
      console.error("Nominatim returned an unexpected geocoding response.");
      return {
        warning: "Nominatim returned an unexpected geocoding response.",
      };
    }

    const result = parsedResults.data.find(
      (candidate) =>
        (candidate.category === "place" &&
          ncrAreaTypes.has(candidate.type)) ||
        (candidate.category === "boundary" &&
          candidate.type === "administrative"),
    );
    const latitude = result ? Number(result.lat) : NaN;
    const longitude = result ? Number(result.lon) : NaN;
    if (
      !result ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < 76.3 ||
      longitude > 78.2 ||
      latitude < 27.7 ||
      latitude > 29.6
    ) {
      return {
        warning: "Nominatim found no matching Delhi NCR area.",
      };
    }

    return {
      coordinates: { longitude, latitude },
    };
  } catch (error) {
    console.error(
      "Nominatim area geocoding request failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return {
      warning: "The Nominatim area lookup failed.",
    };
  }
}

export { geocodeArea };
