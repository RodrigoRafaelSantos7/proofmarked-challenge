import { z } from "zod";
import { define } from "../../../utils.ts";
import { createSupabaseUserClient } from "../../../lib/supabase.ts";
import { writeSessionCookies } from "../../../lib/session.ts";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handler = define.handlers({
  async POST(ctx) {
    const payload = await parseBody(ctx.req);
    const result = LoginSchema.safeParse(payload);

    if (!result.success) {
      return json({ error: "Invalid credentials" }, 400);
    }

    const client = createSupabaseUserClient();
    const {
      data,
      error,
    } = await client.auth.signInWithPassword({
      email: result.data.email.toLowerCase(),
      password: result.data.password,
    });

    if (error) {
      return json({ error: error.message }, error.status ?? 400);
    }

    const session = data.session;
    if (!session) {
      return json({ error: "Missing session response" }, 500);
    }

    const headers = new Headers({ "content-type": "application/json" });
    writeSessionCookies(headers, session);

    const { data: aalData } = await client.auth.mfa
      .getAuthenticatorAssuranceLevel();

    const needsMfa = aalData?.nextLevel === "aal2" &&
      aalData?.currentLevel !== "aal2";

    if (needsMfa) {
      const { data: factorData } = await client.auth.mfa.listFactors();
      const factors = factorData?.factors ?? [];
      const totpFactor = factors.find((factor) =>
        factor.factor_type === "totp"
      );

      if (!totpFactor) {
        return json(
          {
            error: "No MFA factor found. Please enroll MFA.",
            enrollUrl: "/mfa/setup",
          },
          428,
          headers,
        );
      }

      const { data: challenge, error: challengeError } = await client.auth.mfa
        .challenge({ factorId: totpFactor.id });

      if (challengeError || !challenge) {
        return json(
          { error: "Unable to start MFA challenge" },
          500,
          headers,
        );
      }

      return json(
        {
          requiresMfa: true,
          factorId: totpFactor.id,
          challengeId: challenge.id,
          factorLabel: totpFactor.friendly_name ?? "Authenticator app",
        },
        202,
        headers,
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers },
    );
  },
});

async function parseBody(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return await req.json();
  }
  const form = await req.formData();
  return {
    email: form.get("email"),
    password: form.get("password"),
  };
}

function json(
  body: Record<string, unknown>,
  status = 200,
  headers?: Headers,
): Response {
  const responseHeaders = headers ?? new Headers();
  responseHeaders.set("content-type", "application/json");
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}
