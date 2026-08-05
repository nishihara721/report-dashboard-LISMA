import { createClient } from '@supabase/supabase-js';

// ==========================================
// Supabaseクライアントの設定
// 環境変数からURLとAPIキーを読み込んでいます
// ==========================================
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);