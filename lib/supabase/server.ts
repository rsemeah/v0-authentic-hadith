import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

export async function getSupabaseServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
