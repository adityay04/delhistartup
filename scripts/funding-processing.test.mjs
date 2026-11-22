"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import {
  getDelhiNcrCity,
  getTrustedSourceUrl,
  htmlToText,
  validateCompanyName,
  validateLocationEvidence,
  slugifyCompanyName,
} from "./funding-processing.mjs";

test("normalizes NCR city names without classifying unrelated cities", () => {
  assert.equal(getDelhiNcrCity("New Delhi"), "Delhi");
  assert.equal(getDelhiNcrCity("Gurgaon"), "Gurugram");
  assert.equal(getDelhiNcrCity("Noida"), "Noida");
  assert.equal(getDelhiNcrCity("Bengaluru"), null);
});

test("accepts only HTTPS articles from the configured funding publications", () => {
  assert.equal(
    getTrustedSourceUrl("https://inc42.com/buzz/round/#article"),
    "https://inc42.com/buzz/round/",
  );
  assert.equal(
    getTrustedSourceUrl("https://yourstory.com/2026/round"),
    "https://yourstory.com/2026/round",
  );
  assert.equal(getTrustedSourceUrl("https://inc42.com.evil.example/"), null);
  assert.equal(getTrustedSourceUrl("http://inc42.com/article"), null);
});

test("extracts readable text and decodes common HTML entities", () => {
  assert.equal(
    htmlToText(
      "<html><script>hidden</script><p>Varaha&nbsp;is based in Gurugram &amp; India.</p></html>",
    ),
    "Varaha is based in Gurugram & India.",
  );
  assert.equal(htmlToText("Invalid &#x110000; entity"), "Invalid entity");
});

test("rejects a feed headline when it differs from the article's company name", () => {
  const articleText =
    "Swish is headquartered in Gurugram and operates across India.";
  const valid = {
    articleText,
    candidateName: "Swish",
    canonicalName: "Swish",
    companyMatches: true,
  };

  assert.equal(validateCompanyName(valid), "Swish");
  assert.equal(
    validateCompanyName({
      ...valid,
      candidateName: "Swish FY26: Revenue Surges in Gurugram",
    }),
    null,
  );
  assert.equal(
    validateCompanyName({
      articleText:
        "Swish FY26: Revenue Surges in Gurugram. Swish is headquartered in Gurugram.",
      candidateName: "Swish FY26: Revenue Surges in Gurugram",
      canonicalName: "Swish FY26: Revenue Surges in Gurugram",
      companyMatches: true,
    }),
    null,
  );
  assert.equal(
    validateCompanyName({ ...valid, canonicalName: "Unknown Startup" }),
    null,
  );
});

test("requires an exact article quote and an explicit NCR city before approval", () => {
  const articleText =
    "Varaha is headquartered in Sector 54, Gurugram and operates across India.";
  const valid = {
    articleText,
    companyName: "Varaha",
    companyMatches: true,
    city: "Gurugram",
    area: "Sector 54",
    evidenceQuote:
      "Varaha is headquartered in Sector 54, Gurugram and operates across India.",
  };

  assert.deepEqual(validateLocationEvidence(valid), {
    city: "Gurugram",
    area: "Sector 54",
  });
  assert.equal(
    validateLocationEvidence({ ...valid, evidenceQuote: "Based in Gurugram." }),
    null,
  );
  assert.equal(validateLocationEvidence({ ...valid, city: "Bengaluru" }), null);
  assert.equal(
    validateLocationEvidence({ ...valid, companyMatches: false }),
    null,
  );
});

test("creates stable, URL-safe company slugs", () => {
  assert.equal(slugifyCompanyName("Reo.Dev"), "reo-dev");
  assert.equal(slugifyCompanyName("  Delhi Startup  "), "delhi-startup");
});
