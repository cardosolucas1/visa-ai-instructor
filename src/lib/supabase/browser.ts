import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

type BrowserClientOptions = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const createSupabaseBrowserClient = (
  options: BrowserClientOptions = {},
) => {
  const env =
    options.supabaseUrl && options.supabaseAnonKey
      ? {
          NEXT_PUBLIC_SUPABASE_URL: options.supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: options.supabaseAnonKey,
        }
      : getPublicEnv();

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};
