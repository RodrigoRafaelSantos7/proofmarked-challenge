import {
  type Cookie,
  deleteCookie,
  getCookies,
  setCookie,
} from "@std/http/cookie";
import type { Session } from "@supabase/supabase-js";
import { type AuthTokens, clientFromTokens } from "./supabase.ts";

const ACCESS_COOKIE = "pm_access";
const REFRESH_COOKIE = "pm_refresh";

const envSecure = Deno.env.get("COOKIE_SECURE")?.trim();
const defaultSecure = Boolean(Deno.env.get("DENO_DEPLOYMENT_ID"));
const secureFlag = envSecure ? envSecure !== "false" : defaultSecure;

type SessionTokens = Pick<Session, "access_token" | "refresh_token">;

const baseCookie: Omit<Cookie, "name" | "value"> = {
  httpOnly: true,
  sameSite: "Lax",
  path: "/",
  secure: secureFlag,
};

export function readAuthTokens(req: Request): AuthTokens | null {
  const cookies = getCookies(req.headers);
  const accessToken = cookies[ACCESS_COOKIE];
  const refreshToken = cookies[REFRESH_COOKIE];
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export function writeSessionCookies(headers: Headers, session: SessionTokens) {
  if (!session.access_token || !session.refresh_token) {
    throw new Error("Session is missing auth tokens");
  }
  setCookie(headers, {
    ...baseCookie,
    name: ACCESS_COOKIE,
    value: session.access_token,
  });
  setCookie(headers, {
    ...baseCookie,
    name: REFRESH_COOKIE,
    value: session.refresh_token,
  });
}

export function clearSessionCookies(headers: Headers) {
  deleteCookie(headers, ACCESS_COOKIE, { path: "/" });
  deleteCookie(headers, REFRESH_COOKIE, { path: "/" });
}

export async function getSessionFromRequest(req: Request) {
  const tokens = readAuthTokens(req);
  if (!tokens) {
    return null;
  }

  try {
    const client = await clientFromTokens(tokens);
    const { data } = await client.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}
