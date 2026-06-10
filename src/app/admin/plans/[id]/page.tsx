import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PlanEditor } from "../PlanEditor";
import type { Company, Plan } from "@/types/contract";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const [{ data: companies }, { data: plan }] = await Promise.all([
    supabase.from("companies").select("id, code, name, seller_info, created_at").order("name"),
    supabase.from("plans").select("*").eq("id", params.id).single(),
  ]);
  if (!plan) notFound();
  return <PlanEditor companies={(companies ?? []) as Company[]} plan={plan as Plan} />;
}
