import type { MiddlewareHandlerContext } from "fresh";
import { getSessionFromRequest, readAuthTokens } from "./lib/session.ts";
import { clientFromTokens } from "./lib/supabase.ts";
import { type State } from "./utils.ts";

const DASHBOARD_PATH = "/dashboard";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.startsWith("/api")) {
    return await ctx.next();
  }

  const session = await getSessionFromRequest(req);
  ctx.state.session = session;

  if (!pathname.startsWith(DASHBOARD_PATH)) {
    return await ctx.next();
  }

  if (!session) {
    return Response.redirect(new URL("/login", req.url), 302);
  }

  const tokens = readAuthTokens(req);
  if (!tokens) {
    return Response.redirect(new URL("/login", req.url), 302);
  }

  const client = await clientFromTokens(tokens);
  const { data } = await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (data?.currentLevel !== "aal2") {
    return Response.redirect(new URL("/mfa/verify", req.url), 302);
  }

  return await ctx.next();
}
