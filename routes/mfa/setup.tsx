import { Head } from "fresh/runtime";
import { z } from "zod";
import { StepLayout } from "../../components/StepLayout.tsx";
import { Alert } from "../../components/Alert.tsx";
import { FormActions, FormField } from "../../components/Form.tsx";
import { clientFromSession } from "../../lib/supabase.ts";
import { writeSessionCookies } from "../../lib/session.ts";
import { define, type State } from "../../utils.ts";

const verifySchema = z.object({
  code: z.string().min(6).max(10),
  factorId: z.string().min(1),
});

type RouteCtx<T> = {
  req: Request;
  state: State;
  render: (data: T) => Response | Promise<Response>;
};

interface SetupPageData {
  factorId: string;
  qrCode: string;
  secret: string;
  error?: string;
}

export default define.route({
  async GET(ctx: RouteCtx<SetupPageData>) {
    if (!ctx.state.session) {
      return Response.redirect(new URL("/login", ctx.req.url), 302);
    }

    const client = await clientFromSession(ctx.state.session);
    const { data: factorData } = await client.auth.mfa.listFactors();
    const verifiedFactor = factorData?.all?.find((factor) =>
      factor.factor_type === "totp" && factor.status === "verified"
    );

    if (verifiedFactor) {
      return Response.redirect(new URL("/dashboard", ctx.req.url), 302);
    }

    const { data, error } = await client.auth.mfa.enroll({
      factorType: "totp",
    });

    if (error || !data?.totp?.qr_code) {
      return ctx.render({
        error: "Unable to create a TOTP factor. Please try again later.",
        factorId: "",
        qrCode: "",
        secret: "",
      });
    }

    return ctx.render({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  },

  async POST(ctx: RouteCtx<SetupPageData>) {
    if (!ctx.state.session) {
      return Response.redirect(new URL("/login", ctx.req.url), 302);
    }

    const form = await ctx.req.formData();
    const payload = {
      code: form.get("code"),
      factorId: form.get("factorId"),
    };

    const parsed = verifySchema.safeParse(payload);
    if (!parsed.success) {
      return Response.redirect(
        new URL("/mfa/setup?error=invalid", ctx.req.url),
        303,
      );
    }

    const client = await clientFromSession(ctx.state.session);
    const { data, error } = await client.auth.mfa.challengeAndVerify({
      factorId: parsed.data.factorId,
      code: parsed.data.code,
    });

    if (error || !data) {
      return Response.redirect(
        new URL("/mfa/setup?error=invalid", ctx.req.url),
        303,
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
      return Response.redirect(
        new URL("/mfa/setup?error=invalid", ctx.req.url),
        303,
      );
    }

    const headers = new Headers();
    writeSessionCookies(headers, sessionData.session);
    headers.set("location", "/dashboard");
    return new Response(null, { status: 303, headers });
  },

  Component({ data, url }: { data: SetupPageData; url: URL }) {
    const searchParams = url.searchParams;
    const errorParam = searchParams.get("error");
    return (
      <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto space-y-12">
        <Head>
          <title>MFA enrollment · Proofmarked</title>
        </Head>
        <StepLayout
          eyebrow="Step 3 · Enroll MFA"
          title="Scan the QR code and confirm your authenticator"
          intro="Use any TOTP-compatible authenticator (1Password, Duo, Google Authenticator). Until this step succeeds you cannot access the dashboard."
          aside={
            <div class="space-y-4 text-sm text-slate-600">
              <p class="font-semibold text-slate-900">Authenticator tips</p>
              <ul class="list-disc list-inside space-y-2">
                <li>
                  QR code expires after 30 seconds. Refresh to get a new one.
                </li>
                <li>
                  Store recovery codes safely; Proofmarked support cannot bypass
                  MFA.
                </li>
              </ul>
            </div>
          }
        >
          <div class="space-y-6">
            {errorParam && (
              <Alert variant="danger">
                Verification failed. Make sure you enter the fresh code from
                your authenticator.
              </Alert>
            )}
            {data.error && <Alert variant="danger">{data.error}</Alert>}
            <div class="grid gap-6 lg:grid-cols-[280px_1fr] items-center">
              <div class="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center gap-4">
                {data.qrCode
                  ? (
                    <img
                      src={data.qrCode}
                      alt="MFA QR code"
                      class="w-48 h-48 object-contain"
                    />
                  )
                  : (
                    <p class="text-center text-slate-500">
                      Unable to render QR code.
                    </p>
                  )}
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Scan me
                </p>
              </div>
              <div class="space-y-3">
                <p class="font-mono text-slate-600">
                  Secret: {data.secret ?? "—"}
                </p>
                <p class="text-sm text-slate-500">
                  Keep this secret offline as a break-glass backup. Anyone with
                  this secret can generate valid codes.
                </p>
              </div>
            </div>
            <form method="post" class="space-y-5">
              <input type="hidden" name="factorId" value={data.factorId} />
              <FormField
                label="Enter the 6-digit code"
                htmlFor="code"
                hint="Codes rotate every 30 seconds."
              >
                <input
                  class="input tracking-[0.5em] text-center text-xl"
                  id="code"
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="0 0 0 0 0 0"
                  required
                />
              </FormField>
              <FormActions
                primary={
                  <button class="btn btn-primary" type="submit">
                    Verify & finish
                  </button>
                }
                secondary={
                  <a class="btn btn-secondary" href="/dashboard">
                    Skip (will be blocked)
                  </a>
                }
              />
            </form>
          </div>
        </StepLayout>
      </main>
    );
  },
});
