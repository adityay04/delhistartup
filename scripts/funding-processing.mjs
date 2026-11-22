"use strict";

const TRUSTED_SOURCE_HOSTS = new Set(["inc42.com", "yourstory.com"]);

const NCR_CITIES = new Map([
  ["delhi", "Delhi"],
  ["new delhi", "Delhi"],
  ["gurugram", "Gurugram"],
  ["gurgaon", "Gurugram"],
  ["noida", "Noida"],
  ["ghaziabad", "Ghaziabad"],
  ["faridabad", "Faridabad"],
]);

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function includesPhrase(text, phrase) {
  const normalizedText = normalizeText(text);
  const normalizedPhrase = normalizeText(phrase);
  return Boolean(
    normalizedPhrase && ` ${normalizedText} `.includes(` ${normalizedPhrase} `),
  );
}

function getDelhiNcrCity(value) {
  return NCR_CITIES.get(normalizeText(value)) || null;
}

function validateCompanyName({
  articleText,
  candidateName,
  canonicalName,
  companyMatches,
}) {
  const normalizedCandidate = normalizeText(candidateName);
  const normalizedCanonical = normalizeText(canonicalName);
  const candidateIsHeadlineLike =
    /:\s|\bFY\d{2,4}\b|\b(?:revenue\s+surges|revenue\s+jumps|funding\s+round)\b/i.test(
      String(candidateName || ""),
    );
  if (
    companyMatches !== true ||
    candidateIsHeadlineLike ||
    normalizedCanonical.length < 2 ||
    normalizedCanonical.length > 80 ||
    normalizedCandidate !== normalizedCanonical ||
    !includesPhrase(articleText, canonicalName)
  ) {
    return null;
  }

  return canonicalName.trim().replace(/\s+/g, " ");
}

function getTrustedSourceUrl(value) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const trustedHost = [...TRUSTED_SOURCE_HOSTS].some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !trustedHost
    ) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function decodeNumericEntity(value, radix) {
  const codePoint = Number.parseInt(value, radix);
  return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
    ? String.fromCodePoint(codePoint)
    : " ";
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (entity, codePoint) =>
      decodeNumericEntity(codePoint, 10),
    )
    .replace(/&#x([0-9a-f]+);/gi, (entity, codePoint) =>
      decodeNumericEntity(codePoint, 16),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function validateLocationEvidence({
  articleText,
  companyName,
  companyMatches,
  city,
  area,
  evidenceQuote,
}) {
  const canonicalCity = getDelhiNcrCity(city);
  if (
    !canonicalCity ||
    companyMatches !== true ||
    !includesPhrase(articleText, companyName) ||
    typeof evidenceQuote !== "string" ||
    normalizeText(evidenceQuote).length < 24 ||
    !includesPhrase(articleText, evidenceQuote) ||
    !includesPhrase(evidenceQuote, canonicalCity)
  ) {
    return null;
  }

  const confirmedArea =
    typeof area === "string" &&
    includesPhrase(evidenceQuote, area) &&
    normalizeText(area).length > 1
      ? area.trim()
      : null;

  return { city: canonicalCity, area: confirmedArea };
}

function slugifyCompanyName(value) {
  return String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export {
  getDelhiNcrCity,
  getTrustedSourceUrl,
  htmlToText,
  validateCompanyName,
  validateLocationEvidence,
  slugifyCompanyName,
};
