import { createClient, type Session } from "@supabase/supabase-js";
import { env } from "./env.ts";

const baseOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const supabaseAdmin = createClient(
  env.supabaseUrl(),
  env.supabaseServiceKey(),
  baseOptions,
);

export function createSupabaseUserClient() {
  return createClient(env.supabaseUrl(), env.supabaseAnonKey(), baseOptions);
}

export async function clientFromSession(session: Session | null) {
  const client = createSupabaseUserClient();
  if (session?.access_token && session?.refresh_token) {
    await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
  return client;
}

export async function clientFromTokens(tokens?: Partial<AuthTokens>) {
  const client = createSupabaseUserClient();
  if (tokens?.accessToken && tokens?.refreshToken) {
    await client.auth.setSession({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
  }
  return client;
}
