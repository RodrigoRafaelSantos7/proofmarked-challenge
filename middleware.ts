import { getSessionFromRequest, readAuthTokens } from "./lib/session.ts";
import { clientFromTokens } from "./lib/supabase.ts";
import { define } from "./utils.ts";

const DASHBOARD_PATH = "/dashboard";

const SKIP_SESSION_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/set-password",
  "/api/auth/mfa/verify",
  "/api/auth/mfa/challenge",
  "/auth/callback",
];

export const handler = define.middleware(async (ctx) => {
  const url = new URL(ctx.req.url);
  const pathname = url.pathname;

  if (SKIP_SESSION_ROUTES.some((route) => pathname.startsWith(route))) {
    return await ctx.next();
  }

  const session = await getSessionFromRequest(ctx.req);
  ctx.state.session = session;

  if (!pathname.startsWith(DASHBOARD_PATH)) {
    return await ctx.next();
  }

  if (!session) {
    return Response.redirect(new URL("/login", ctx.req.url), 302);
  }

  const tokens = readAuthTokens(ctx.req);
  if (!tokens) {
    return Response.redirect(new URL("/login", ctx.req.url), 302);
  }

  let client;
  try {
    client = await clientFromTokens(tokens);
  } catch {
    return Response.redirect(new URL("/login", ctx.req.url), 302);
  }

  const { data: aalData } = await client.auth.mfa
    .getAuthenticatorAssuranceLevel();
  const { data: factorData } = await client.auth.mfa.listFactors();

  const hasVerifiedFactor = factorData?.totp?.some((f) =>
    f.status === "verified"
  );

  if (!hasVerifiedFactor) {
    return Response.redirect(new URL("/mfa/setup", ctx.req.url), 302);
  }

  if (aalData?.currentLevel !== "aal2") {
    return Response.redirect(new URL("/mfa/verify", ctx.req.url), 302);
  }

  return await ctx.next();
});
