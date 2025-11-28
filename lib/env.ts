import { loadSync } from "@std/dotenv";

type EnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) {
    return;
  }
  try {
    loadSync({ export: true });
  } catch {
    // Ignore if .env is missing; we'll rely on the actual env vars.
  } finally {
    envLoaded = true;
  }
}

export function requireEnv(key: EnvKey): string {
  ensureEnvLoaded();
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => requireEnv("SUPABASE_URL"),
  supabaseAnonKey: () => requireEnv("SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
