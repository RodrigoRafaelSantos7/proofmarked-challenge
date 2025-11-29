import { page } from "fresh";
import { Head } from "fresh/runtime";
import MfaVerifyForm from "../../islands/MfaVerifyForm.tsx";
import { clientFromSession } from "../../lib/supabase.ts";
import { StepLayout } from "../../components/StepLayout.tsx";
import { define } from "../../utils.ts";

interface VerifyPageData {
  factorId: string;
  factorLabel: string;
}

export const handler = define.handlers({
  async GET(ctx) {
    if (!ctx.state.session) {
      return Response.redirect(new URL("/login", ctx.req.url), 302);
    }

    const client = await clientFromSession(ctx.state.session);
    const { data: factorData } = await client.auth.mfa.listFactors();
    const totpFactor = factorData?.totp?.find((f) => f.status === "verified");

    if (!totpFactor) {
      return Response.redirect(new URL("/mfa/setup", ctx.req.url), 302);
    }

    const { data: aalData } = await client.auth.mfa
      .getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return Response.redirect(new URL("/dashboard", ctx.req.url), 302);
    }

    return page(
      {
        factorId: totpFactor.id,
        factorLabel: totpFactor.friendly_name ?? "Authenticator",
      } satisfies VerifyPageData,
    );
  },
});

export default define.page<typeof handler>(function MfaVerifyPage({ data }) {
  const steps = (
    <ol class="progress-list">
      <li class="progress-item complete">
        <span class="progress-badge">1</span>
        <div class="progress-content">
          <p class="progress-title">Password</p>
          <p class="progress-description">Session validated.</p>
        </div>
      </li>
      <li class="progress-item complete">
        <span class="progress-badge">2</span>
        <div class="progress-content">
          <p class="progress-title">MFA Challenge</p>
          <p class="progress-description">
            We issued a fresh challenge for {data.factorLabel}.
          </p>
        </div>
      </li>
      <li class="progress-item">
        <span class="progress-badge">3</span>
        <div class="progress-content">
          <p class="progress-title">Dashboard</p>
          <p class="progress-description">
            AAL2 session unlocked after success.
          </p>
        </div>
      </li>
    </ol>
  );

  return (
    <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
      <Head>
        <title>Verify MFA</title>
      </Head>
      <StepLayout
        eyebrow="Step 3 · Verification"
        title="Enter a live code"
        intro="We generated a new challenge on the server; enter the code currently displayed in your authenticator to finish signing in."
        aside={steps}
      >
        <MfaVerifyForm
          factorId={data.factorId}
          factorLabel={data.factorLabel}
        />
      </StepLayout>
    </main>
  );
});
