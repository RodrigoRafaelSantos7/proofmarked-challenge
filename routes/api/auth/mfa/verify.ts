import { z } from "zod";
import { define } from "../../../../utils.ts";
import { clientFromTokens } from "../../../../lib/supabase.ts";
import {
  readAuthTokens,
  writeSessionCookies,
} from "../../../../lib/session.ts";

const schema = z.object({
  factorId: z.string().min(1),
  challengeId: z.string().min(1),
  code: z.string().min(6).max(10),
});

export const handler = define.handlers({
  async POST(ctx) {
    const tokens = readAuthTokens(ctx.req);
    if (!tokens) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await ctx.req.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientFromTokens(tokens);
    const { data, error } = await client.auth.mfa.verify({
      factorId: parsed.data.factorId,
      challengeId: parsed.data.challengeId,
      code: parsed.data.code,
    });

    if (error || !data) {
      return Response.json(
        { error: error?.message ?? "Verification failed" },
        { status: 400 },
      );
    }

    const {
      data: sessionData,
      error: sessionError,
    } = await client.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionError || !sessionData.session) {
      return Response.json(
        { error: sessionError?.message ?? "Unable to refresh session" },
        { status: 400 },
      );
    }

    const headers = new Headers();
    writeSessionCookies(headers, sessionData.session);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  },
});
