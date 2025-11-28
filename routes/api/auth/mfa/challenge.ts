import { z } from "zod";
import { define } from "../../../../utils.ts";
import { clientFromTokens } from "../../../../lib/supabase.ts";
import { readAuthTokens } from "../../../../lib/session.ts";

const schema = z.object({
  factorId: z.string().min(1),
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
    const { data, error } = await client.auth.mfa.challenge({
      factorId: parsed.data.factorId,
    });

    if (error || !data) {
      return Response.json(
        { error: "Unable to refresh challenge" },
        { status: 500 },
      );
    }

    return Response.json({ challengeId: data.id });
  },
});
