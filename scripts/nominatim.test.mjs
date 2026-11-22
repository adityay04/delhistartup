"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import { geocodeArea } from "../src/lib/nominatim.mjs";

test("geocodes and bounds an area-level result with an identifying request", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl;
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return new Response(
      JSON.stringify([
        {
          lat: "28.4421059",
          lon: "77.1112654",
          category: "boundary",
          type: "administrative",
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const result = await geocodeArea("Sector 54", "Gurugram");
    assert.deepEqual(result, {
      coordinates: { longitude: 77.1112654, latitude: 28.4421059 },
    });
    assert.equal(new URL(requestUrl).searchParams.get("bounded"), "1");
    assert.equal(
      new URL(requestUrl).searchParams.get("q"),
      "Sector 54, Gurugram, India",
    );
    assert.equal(requestOptions.cache, "no-store");
    assert.match(requestOptions.headers["User-Agent"], /^DelhiStartupMap\//);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
