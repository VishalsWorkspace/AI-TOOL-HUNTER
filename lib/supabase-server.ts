import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Read-only server client — used only for soft personalization (knowing who's
// logged in for the Recommended For You section), not as an auth gate. No
// token-refresh/setAll wiring is needed: if a token is stale the query just
// fails gracefully and recommendations don't show, so no middleware required.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: Server Components can't set cookies, and this client is
          // read-only (no sign-in/out/refresh happens here).
        },
      },
    }
  );
}
