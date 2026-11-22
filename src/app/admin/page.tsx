import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Entity, FundingLead } from "@/lib/types";
import { ENTITY_SOURCE_MAX_AGE_DAYS, getFreshnessCutoff } from "@/lib/dataFreshness";
import AdminDashboard from "./AdminDashboard";

export const instant = false;

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fcfcfd] dark:bg-[#09090b] p-8 text-sm text-[#454545] dark:text-[#a1a1aa]">
          Loading source review…
        </main>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  await connection();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) redirect("/admin/login?error=config");

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || user?.email?.toLowerCase() !== adminEmail) {
    redirect("/admin/login");
  }

  const sourceCutoff = getFreshnessCutoff(ENTITY_SOURCE_MAX_AGE_DAYS);
  const { data, error } = await supabase
    .from("entities")
    .select("*")
    .or(
      `is_verified.eq.false,source_url.is.null,source_checked_at.is.null,source_checked_at.lt.${sourceCutoff},lat.is.null,lng.is.null`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load listings that need source review: ${error.message}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server-side funding lead access is not configured.");
  }

  const adminDatabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: fundingLeadData,
    error: fundingLeadError,
  } = await adminDatabase
    .from("funding_leads")
    .select(
      "lead_key,company_name,headline,source_url,source_name,source_published_at,review_reason",
    )
    .eq("status", "needs_review")
    .order("source_published_at", { ascending: false, nullsFirst: false })
    .limit(25);
  if (fundingLeadError) {
    throw new Error(
      `Unable to load funding leads needing review: ${fundingLeadError.message}`,
    );
  }

  return (
    <AdminDashboard
      entities={(data || []) as Entity[]}
      fundingLeads={(fundingLeadData || []) as FundingLead[]}
    />
  );
}
