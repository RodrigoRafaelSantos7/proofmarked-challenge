import { z } from "zod";
import { define } from "../../../utils.ts";
import { clientFromTokens } from "../../../lib/supabase.ts";
import { writeSessionCookies } from "../../../lib/session.ts";

const schema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  password: z.string().min(8),
});

async function parseRequestBody(
  req: Request,
): Promise<Record<string, unknown>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    return {
      accessToken: formData.get("accessToken"),
      refreshToken: formData.get("refreshToken"),
      password: formData.get("password"),
    };
  }

  return await req.json();
}

function errorRedirect(url: URL, error: string): Response {
  const target = new URL("/auth/callback", url);
  target.searchParams.set("error", error);
  return Response.redirect(target, 303);
}

async function refreshServerSession(
  client: Awaited<ReturnType<typeof clientFromTokens>>,
) {
  const { data, error } = await client.auth.refreshSession();
  if (!error && data.session) {
    return data.session;
  }

  const fallback = await client.auth.getSession();
  return fallback.data.session ?? null;
}

export const handler = define.handlers({
  async POST(ctx) {
    const payload = await parseRequestBody(ctx.req);
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return errorRedirect(
        new URL(ctx.req.url),
        "Invalid request. Password must be at least 8 characters.",
      );
    }

    let client: Awaited<ReturnType<typeof clientFromTokens>>;
    try {
      client = await clientFromTokens({
        accessToken: parsed.data.accessToken,
        refreshToken: parsed.data.refreshToken,
      });
    } catch {
      return errorRedirect(
        new URL(ctx.req.url),
        "Your invitation link expired. Request a new one.",
      );
    }

    const { error } = await client.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return errorRedirect(
        new URL(ctx.req.url),
        error.message || "Failed to set password.",
      );
    }

    const nextSession = await refreshServerSession(client);
    if (!nextSession) {
      return errorRedirect(
        new URL(ctx.req.url),
        "Session error. Please try again.",
      );
    }

    const headers = new Headers();
    writeSessionCookies(headers, nextSession);
    headers.set("location", "/mfa/setup");
    return new Response(null, { status: 303, headers });
  },
});
