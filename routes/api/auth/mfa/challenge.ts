import { z } from "zod";
import { define } from "../../../../utils.ts";
import { clientFromTokens } from "../../../../lib/supabase.ts";
import { readAuthTokens } from "../../../../lib/session.ts";

const schema = z.object({
  factorId: z.string().min(1),
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
    const { data, error } = await client.auth.mfa.challenge({
      factorId: parsed.data.factorId,
    });

    if (error || !data) {
      return Response.json(
        { error: error?.message ?? "Unable to create challenge" },
        { status: 500 },
      );
    }

    return Response.json({ challengeId: data.id });
  },
});
