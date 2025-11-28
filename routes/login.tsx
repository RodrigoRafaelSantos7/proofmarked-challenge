import { Head } from "fresh/runtime";
import LoginForm from "../islands/LoginForm.tsx";
import { StepLayout } from "../components/StepLayout.tsx";
import { define } from "../utils.ts";

export default define.page(function LoginPage() {
  return (
    <main class="px-6 lg:px-12 py-16 max-w-4xl mx-auto space-y-12">
      <Head>
        <title>Login · Proofmarked</title>
      </Head>

      <StepLayout
        eyebrow="Step 2 · Authentication"
        title="Login and satisfy MFA"
        intro="Your password gets you to AAL1. Completing the TOTP challenge upgrades the session to AAL2 which unlocks the dashboard."
        aside={
          <div class="space-y-4 text-sm text-slate-600">
            <p class="font-semibold text-slate-900">Need to enroll MFA?</p>
            <p>
              If this is your first time, login once with your password, then
              head to the enrollment screen to bind an authenticator app.
            </p>
            <a class="btn btn-secondary w-full text-center" href="/mfa/setup">
              Set up MFA
            </a>
          </div>
        }
      >
        <LoginForm />
      </StepLayout>
    </main>
  );
});
