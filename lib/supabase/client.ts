import { createBrowserClient } from "@supabase/ssr"

const globalForSupabase = globalThis as unknown as {
  __supabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined
}

export function getSupabaseBrowserClient() {
  if (globalForSupabase.__supabaseBrowserClient) {
    return globalForSupabase.__supabaseBrowserClient
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  globalForSupabase.__supabaseBrowserClient = client

  return client
}
