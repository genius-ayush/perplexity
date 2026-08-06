// import { createBrowserClient } from '@supabase/ssr'
import { createClient } from "@supabase/supabase-js"

export default function createSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
