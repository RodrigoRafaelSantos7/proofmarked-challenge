import { z } from "zod";
import { define } from "../../../../utils.ts";
import { clientFromTokens } from "../../../../lib/supabase.ts";
import {
  readAuthTokens,
  writeSessionCookies,
} from "../../../../lib/session.ts";

const schema = z.object({
  factorId: z.string().min(1),
  code: z.string().min(6).max(10),
  tempTokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }).optional(),
});

export const handler = define.handlers({
  async POST(ctx) {
    const payload = await ctx.req.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    const tokens = parsed.data.tempTokens ?? readAuthTokens(ctx.req);
    if (!tokens) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    let client;
    try {
      client = await clientFromTokens(tokens);
    } catch {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: challengeData, error: challengeError } = await client.auth
      .mfa.challenge({
        factorId: parsed.data.factorId,
      });

    if (challengeError || !challengeData) {
      return Response.json(
        { error: challengeError?.message ?? "Failed to create challenge" },
        { status: 400 },
      );
    }

    const { data, error } = await client.auth.mfa.verify({
      factorId: parsed.data.factorId,
      challengeId: challengeData.id,
      code: parsed.data.code,
    });

    if (error || !data) {
      return Response.json(
        { error: error?.message ?? "Verification failed" },
        { status: 400 },
      );
    }

    const headers = new Headers({ "content-type": "application/json" });
    writeSessionCookies(headers, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  },
});
