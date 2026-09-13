import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Service-role client — bypasses RLS. Used exclusively for writes in server
 * actions, route handlers, and scripts/seed-clothing-items.ts. Never import
 * this from a "use client" file. No `import "server-only"` guard: that
 * package's default (non-RSC) export throws unconditionally, which breaks
 * the seed script's plain Node/tsx execution; SUPABASE_SERVICE_ROLE_KEY is
 * never NEXT_PUBLIC_-prefixed, so it can't leak into a client bundle anyway.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
