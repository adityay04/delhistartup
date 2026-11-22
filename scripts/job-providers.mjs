"use strict";

const PROVIDERS = new Set(["greenhouse", "lever", "ashby"]);

function requireJobList(provider, payload) {
  if (!PROVIDERS.has(provider)) {
    throw new Error(`Unsupported job provider: ${provider}`);
  }

  const jobs = provider === "lever" ? payload : payload?.jobs;
  if (!Array.isArray(jobs)) {
    throw new Error(`The ${provider} response did not contain a job list.`);
  }
  return jobs;
}

function normalizeJobs(provider, payload) {
  return requireJobList(provider, payload)
    .filter((job) => !(provider === "ashby" && job?.isListed === false))
    .map((job) => {
      if (!job || typeof job !== "object") {
        throw new Error(`The ${provider} response contained an invalid job.`);
      }

      const rawTitle = provider === "lever" ? job.text : job.title;
      const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
      const sourceUrl =
        provider === "greenhouse"
          ? job.absolute_url
          : provider === "lever"
            ? job.hostedUrl
            : job.jobUrl;
      if (!title || typeof sourceUrl !== "string") {
        throw new Error(`The ${provider} response contained a job without a title or URL.`);
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(sourceUrl);
      } catch {
        throw new Error(`The ${provider} response contained an invalid job URL.`);
      }
      if (parsedUrl.protocol !== "https:") {
        throw new Error(`The ${provider} response contained a non-HTTPS job URL.`);
      }

      const location =
        provider === "greenhouse"
          ? job.location?.name
          : provider === "lever"
            ? job.categories?.location
            : job.location;
      const employmentType =
        provider === "greenhouse"
          ? job.employment_type
          : provider === "lever"
            ? job.categories?.commitment
            : job.employmentType;

      return {
        title,
        location: typeof location === "string" && location.trim() ? location.trim() : null,
        employment_type:
          typeof employmentType === "string" && employmentType.trim()
            ? employmentType.trim()
            : null,
        source_url: parsedUrl.toString(),
      };
    });
}

function getProviderRequest(provider, boardIdentifier) {
  const board = encodeURIComponent(boardIdentifier);
  switch (provider) {
    case "greenhouse":
      return `https://boards-api.greenhouse.io/v1/boards/${board}/jobs`;
    case "lever":
      return `https://api.lever.co/v0/postings/${board}?mode=json`;
    case "ashby":
      return `https://api.ashbyhq.com/posting-api/job-board/${board}`;
    default:
      throw new Error(`Unsupported job provider: ${provider}`);
  }
}

function getProviderBoardUrl(provider, boardIdentifier) {
  const board = encodeURIComponent(boardIdentifier);
  switch (provider) {
    case "greenhouse":
      return `https://boards.greenhouse.io/${board}`;
    case "lever":
      return `https://jobs.lever.co/${board}`;
    case "ashby":
      return `https://jobs.ashbyhq.com/${board}`;
    default:
      throw new Error(`Unsupported job provider: ${provider}`);
  }
}

export { getProviderBoardUrl, getProviderRequest, normalizeJobs };
