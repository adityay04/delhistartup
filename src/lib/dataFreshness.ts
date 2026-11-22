export const ENTITY_SOURCE_MAX_AGE_DAYS = 90;
export const JOB_POSTING_MAX_AGE_DAYS = 7;

export function getFreshnessCutoff(days: number, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}
