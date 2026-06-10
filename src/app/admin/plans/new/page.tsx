import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PlanEditor } from "../PlanEditor";
import type { Company } from "@/types/contract";

export const dynamic = "force-dynamic";

export default async function NewPlanPage() {
  const supabase = createSupabaseServerClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, code, name, seller_info, created_at")
    .order("name");
  return <PlanEditor companies={(companies ?? []) as Company[]} />;
}
