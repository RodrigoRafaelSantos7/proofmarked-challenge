import { Head } from "fresh/runtime";
import { StepLayout } from "../../components/StepLayout.tsx";
import { Alert } from "../../components/Alert.tsx";
import MfaVerifyForm from "../../islands/MfaVerifyForm.tsx";
import { clientFromSession } from "../../lib/supabase.ts";
import { define, type State } from "../../utils.ts";

type RouteCtx<T> = {
  req: Request;
  state: State;
  render: (data: T) => Response | Promise<Response>;
};

interface VerifyPageData {
  factorId: string;
  factorLabel: string;
  challengeId: string;
}

export default define.route({
  async GET(ctx: RouteCtx<VerifyPageData>) {
    if (!ctx.state.session) {
      return Response.redirect(new URL("/login", ctx.req.url), 302);
    }

    const client = await clientFromSession(ctx.state.session);
    const { data: factorData } = await client.auth.mfa.listFactors();
    const totpFactor = factorData?.all?.find((factor) =>
      factor.factor_type === "totp" && factor.status === "verified"
    );

    if (!totpFactor) {
      return Response.redirect(new URL("/mfa/setup", ctx.req.url), 302);
    }

    const { data: challenge, error } = await client.auth.mfa.challenge({
      factorId: totpFactor.id,
    });

    if (error || !challenge) {
      return ctx.render({
        factorId: totpFactor.id,
        factorLabel: totpFactor.friendly_name ?? "Authenticator",
        challengeId: "",
      });
    }

    return ctx.render({
      factorId: totpFactor.id,
      factorLabel: totpFactor.friendly_name ?? "Authenticator",
      challengeId: challenge.id,
    });
  },

  Component({ data }: { data: VerifyPageData }) {
    return (
      <main class="px-6 lg:px-12 py-16 max-w-3xl mx-auto space-y-12">
        <Head>
          <title>MFA verification · Proofmarked</title>
        </Head>
        <StepLayout
          eyebrow="Step 2b · Challenge"
          title="Complete the MFA challenge"
          intro="For sensitive screens we require an AAL2 session. Enter the code generated in your authenticator app to continue."
        >
          {!data.challengeId && (
            <Alert variant="danger">
              Unable to start a challenge. Refresh to try again.
            </Alert>
          )}
          <MfaVerifyForm
            factorId={data.factorId}
            factorLabel={data.factorLabel}
            initialChallengeId={data.challengeId}
          />
        </StepLayout>
      </main>
    );
  },
});
