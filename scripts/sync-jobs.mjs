"use strict";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  getProviderBoardUrl,
  getProviderRequest,
  normalizeJobs,
} from "./job-providers.mjs";

dotenv.config({ path: ".env.local" });

const LISTING_SOURCE_MAX_AGE_DAYS = 90;
const JOB_POSTING_MAX_AGE_DAYS = 7;
const REQUEST_ATTEMPTS = 3;

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchProviderJobs(provider, boardIdentifier) {
  const url = getProviderRequest(provider, boardIdentifier);

  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "delhi-startup-map-job-sync/1.0",
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      if (attempt === REQUEST_ATTEMPTS) throw error;
      await delay(500 * 2 ** (attempt - 1));
      continue;
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < REQUEST_ATTEMPTS) {
        await delay(500 * 2 ** (attempt - 1));
        continue;
      }
      throw new Error(`${provider} returned HTTP ${response.status}.`);
    }

    return response.json();
  }

  throw new Error(`${provider} request failed after retries.`);
}

async function updateJobSource(supabase, sourceId, values) {
  const { error } = await supabase
    .from("job_sources")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", sourceId);
  if (error) {
    throw new Error(`Unable to update job source ${sourceId}: ${error.message}`);
  }
}

async function syncSource(supabase, source, entity) {
  const checkedAt = new Date();
  const checkedAtIso = checkedAt.toISOString();
  const expiresAt = new Date(
    checkedAt.getTime() + JOB_POSTING_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  await updateJobSource(supabase, source.id, {
    last_attempted_at: checkedAtIso,
    last_error: null,
  });

  try {
    const expectedBoardUrl = getProviderBoardUrl(
      source.provider,
      source.board_identifier,
    );
    if (source.source_url !== expectedBoardUrl) {
      throw new Error(
        `Configured source URL does not match the official ${source.provider} board URL.`,
      );
    }

    const payload = await fetchProviderJobs(
      source.provider,
      source.board_identifier,
    );
    const jobs = normalizeJobs(source.provider, payload).map((job) => ({
      ...job,
      entity_id: entity.id,
      is_active: true,
      last_checked_at: checkedAtIso,
      expires_at: expiresAt,
    }));

    if (jobs.length > 0) {
      const { error } = await supabase
        .from("job_postings")
        .upsert(jobs, { onConflict: "source_url" });
      if (error) {
        throw new Error(`Unable to save ${source.provider} jobs: ${error.message}`);
      }
    }

    const { data: existingJobs, error: existingError } = await supabase
      .from("job_postings")
      .select("id,source_url")
      .eq("entity_id", entity.id)
      .eq("is_active", true);
    if (existingError) {
      throw new Error(`Unable to check existing jobs: ${existingError.message}`);
    }

    const currentUrls = new Set(jobs.map((job) => job.source_url));
    const staleIds = (existingJobs || [])
      .filter((job) => !currentUrls.has(job.source_url))
      .map((job) => job.id);
    if (staleIds.length > 0) {
      const { error } = await supabase
        .from("job_postings")
        .update({ is_active: false })
        .in("id", staleIds);
      if (error) {
        throw new Error(`Unable to deactivate stale jobs: ${error.message}`);
      }
    }

    await updateJobSource(supabase, source.id, {
      last_success_at: checkedAtIso,
      last_error: null,
    });
    console.log(
      `Synced ${jobs.length} current roles for ${entity.name} (${source.provider}).`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await updateJobSource(supabase, source.id, {
        last_error: message.slice(0, 1000),
      });
    } catch (statusError) {
      console.error(
        `Unable to record failure for job source ${source.id}:`,
        statusError,
      );
    }
    throw error;
  }
}

async function loadSources(supabase) {
  const { data: sources, error } = await supabase
    .from("job_sources")
    .select("id,entity_id,provider,board_identifier,source_url")
    .eq("is_active", true);
  if (error) {
    throw new Error(`Unable to load job sources: ${error.message}`);
  }
  if (!sources || sources.length === 0) return [];

  const entityIds = [...new Set(sources.map((source) => source.entity_id))];
  const { data: entities, error: entityError } = await supabase
    .from("entities")
    .select("id,name,is_verified,source_checked_at")
    .in("id", entityIds);
  if (entityError) {
    throw new Error(`Unable to load job-source entities: ${entityError.message}`);
  }

  const entitiesById = new Map((entities || []).map((entity) => [entity.id, entity]));
  const now = Date.now();
  const freshnessCutoff =
    now - LISTING_SOURCE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  return sources.flatMap((source) => {
    const entity = entitiesById.get(source.entity_id);
    const checkedAt = Date.parse(entity?.source_checked_at || "");
    if (
      !entity?.is_verified ||
      !Number.isFinite(checkedAt) ||
      checkedAt < freshnessCutoff ||
      checkedAt > now
    ) {
      console.warn(
        `Skipping job source ${source.id}: its entity is not currently source-checked.`,
      );
      return [];
    }
    return [{ source, entity }];
  });
}

async function main() {
  const supabase = createSupabaseClient();
  const eligibleSources = await loadSources(supabase);
  if (eligibleSources.length === 0) {
    console.log("No active job sources are configured for current verified listings.");
    return;
  }

  let failures = 0;
  for (const { source, entity } of eligibleSources) {
    try {
      await syncSource(supabase, source, entity);
    } catch (error) {
      failures += 1;
      console.error(
        `Failed to sync ${entity.name} (${source.provider}):`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (failures > 0) {
    throw new Error(`Job sync failed for ${failures} of ${eligibleSources.length} sources.`);
  }
}

main().catch((error) => {
  console.error("Job sync failed:", error);
  process.exitCode = 1;
});
