"use strict";

import test from "node:test";
import assert from "node:assert/strict";
import {
  getProviderBoardUrl,
  getProviderRequest,
  normalizeJobs,
} from "./job-providers.mjs";

test("builds provider API URLs from encoded board identifiers", () => {
  assert.equal(
    getProviderRequest("greenhouse", "acme jobs"),
    "https://boards-api.greenhouse.io/v1/boards/acme%20jobs/jobs",
  );
  assert.equal(
    getProviderRequest("lever", "acme jobs"),
    "https://api.lever.co/v0/postings/acme%20jobs?mode=json",
  );
  assert.equal(
    getProviderRequest("ashby", "acme jobs"),
    "https://api.ashbyhq.com/posting-api/job-board/acme%20jobs",
  );
});

test("builds canonical official board URLs", () => {
  assert.equal(
    getProviderBoardUrl("greenhouse", "acme"),
    "https://boards.greenhouse.io/acme",
  );
  assert.equal(
    getProviderBoardUrl("lever", "acme"),
    "https://jobs.lever.co/acme",
  );
  assert.equal(
    getProviderBoardUrl("ashby", "acme"),
    "https://jobs.ashbyhq.com/acme",
  );
});

test("normalizes Greenhouse jobs and keeps the original posting link", () => {
  assert.deepEqual(
    normalizeJobs("greenhouse", {
      jobs: [
        {
          title: " Product Engineer ",
          location: { name: "Delhi, India" },
          absolute_url: "https://boards.greenhouse.io/acme/jobs/1",
        },
      ],
    }),
    [
      {
        title: "Product Engineer",
        location: "Delhi, India",
        employment_type: null,
        source_url: "https://boards.greenhouse.io/acme/jobs/1",
      },
    ],
  );
});

test("normalizes Lever jobs and commitment", () => {
  const [job] = normalizeJobs("lever", [
    {
      text: "Designer",
      hostedUrl: "https://jobs.lever.co/acme/1",
      categories: { location: "Gurugram", commitment: "Full-time" },
    },
  ]);
  assert.equal(job.title, "Designer");
  assert.equal(job.location, "Gurugram");
  assert.equal(job.employment_type, "Full-time");
});

test("normalizes listed Ashby jobs and excludes unlisted postings", () => {
  const jobs = normalizeJobs("ashby", {
    jobs: [
      {
        title: "Analyst",
        location: "Noida",
        employmentType: "FullTime",
        jobUrl: "https://jobs.ashbyhq.com/acme/1",
      },
      {
        title: "Hidden role",
        isListed: false,
        jobUrl: "https://jobs.ashbyhq.com/acme/2",
      },
    ],
  });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].employment_type, "FullTime");
});

test("rejects malformed or non-HTTPS public job links", () => {
  assert.throws(
    () =>
      normalizeJobs("lever", [
        { text: "Role", hostedUrl: "javascript:alert(1)" },
      ]),
    /non-HTTPS/,
  );
  assert.throws(
    () => normalizeJobs("ashby", { jobs: {} }),
    /did not contain a job list/,
  );
});
