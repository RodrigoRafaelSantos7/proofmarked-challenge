import { page } from "fresh";
import { Head } from "fresh/runtime";
import { z } from "zod";
import { Alert } from "../../components/Alert.tsx";
import { StepLayout } from "../../components/StepLayout.tsx";
import { clientFromSession } from "../../lib/supabase.ts";
import { writeSessionCookies } from "../../lib/session.ts";
import { define } from "../../utils.ts";

const verifySchema = z.object({
  code: z.string().min(6).max(10),
  factorId: z.string().min(1),
});

interface SetupPageData {
  factorId: string;
  qrCode: string;
  secret: string;
  error?: string;
}

export const handler = define.handlers({
  async GET(ctx) {
    if (!ctx.state.session) {
      return Response.redirect(new URL("/login", ctx.req.url), 302);
    }

    const client = await clientFromSession(ctx.state.session);
    const { data: factorData } = await client.auth.mfa.listFactors();
    const verifiedFactor = factorData?.totp?.find((f) =>
      f.status === "verified"
    );

    if (verifiedFactor) {
      return Response.redirect(new URL("/dashboard", ctx.req.url), 302);
    }

    const pendingFactor = factorData?.totp?.find((factor) =>
      factor.status !== "verified"
    );

    if (pendingFactor) {
      try {
        await client.auth.mfa.unenroll({ factorId: pendingFactor.id });
      } catch {
      }
    }

    const { data: enrollment, error: enrollError } = await client.auth.mfa
      .enroll({
        factorType: "totp",
      });

    if (enrollError || !enrollment?.totp?.qr_code) {
      return page(
        {
          error: "Unable to set up MFA. Please refresh to try again.",
          factorId: "",
          qrCode: "",
          secret: "",
        } satisfies SetupPageData,
      );
    }

    return page(
      {
        factorId: enrollment.id,
        qrCode: enrollment.totp.qr_code,
        secret: enrollment.totp.secret,
        error: undefined,
      } satisfies SetupPageData,
    );
  },

  async POST(ctx) {
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

    const headers = new Headers();
    writeSessionCookies(headers, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    headers.set("location", "/dashboard");
    return new Response(null, { status: 303, headers });
  },
});

export default define.page<typeof handler>(
  function MfaSetupPage({ data, url }) {
    const errorParam = url.searchParams.get("error");
    const steps = (
      <ol class="progress-list">
        <li class="progress-item">
          <span class="progress-badge">1</span>
          <div class="progress-content">
            <p class="progress-title">Scan QR</p>
            <p class="progress-description">
              Use any TOTP app (1Password, Authy, Google Authenticator).
            </p>
          </div>
        </li>
        <li class="progress-item">
          <span class="progress-badge">2</span>
          <div class="progress-content">
            <p class="progress-title">Confirm Code</p>
            <p class="progress-description">
              Enter a live 6-digit code to verify the factor.
            </p>
          </div>
        </li>
        <li class="progress-item">
          <span class="progress-badge">3</span>
          <div class="progress-content">
            <p class="progress-title">Dashboard</p>
            <p class="progress-description">
              We issue an AAL2 session and redirect you to HelloWorld.
            </p>
          </div>
        </li>
      </ol>
    );

    return (
      <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
        <Head>
          <title>Set Up MFA</title>
        </Head>
        <StepLayout
          eyebrow="Step 3 · MFA Enrollment"
          title="Secure your account"
          intro="MFA is mandatory. Add the factor below and verify a live code to access the dashboard."
          aside={steps}
        >
          {errorParam && (
            <Alert variant="danger">
              Invalid code. Please enter the current code from your
              authenticator.
            </Alert>
          )}
          {data.error && <Alert variant="danger">{data.error}</Alert>}

          {data.qrCode && (
            <>
              <div class="flex flex-col lg:flex-row gap-6 items-center">
                <div class="border border-black bg-white p-4">
                  <img
                    src={data.qrCode}
                    alt="MFA QR code"
                    class="w-48 h-48 object-contain"
                  />
                </div>
                <div class="flex-1 space-y-3">
                  <p class="eyebrow">Manual entry</p>
                  <p class="font-mono text-base bg-white border border-black p-3 break-all">
                    {data.secret}
                  </p>
                  <p class="text-sm text-gray-500">
                    Compatible with any RFC 6238 authenticator.
                  </p>
                </div>
              </div>

              <form method="post" class="space-y-5">
                <input type="hidden" name="factorId" value={data.factorId} />
                <div class="form-field">
                  <label htmlFor="code">6-digit code</label>
                  <input
                    class="input tracking-[0.5em] text-center text-xl"
                    id="code"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </div>
                <button class="btn btn-primary w-full" type="submit">
                  Verify & continue
                </button>
              </form>
            </>
          )}
        </StepLayout>
      </main>
    );
  },
);
