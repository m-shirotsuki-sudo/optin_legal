import { createClient } from "@supabase/supabase-js";

/**
 * service_role キーを使うサーバーサイド専用クライアント。
 * 管理画面のテンプレ保存、PDF生成（公開しないテンプレ取得）、Storage管理に使う。
 * 絶対にクライアントへ送らないこと。
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
