import { Head } from "fresh/runtime";
import { z } from "zod";
import { Alert } from "../components/Alert.tsx";
import { StepLayout } from "../components/StepLayout.tsx";
import { supabaseAdmin } from "../lib/supabase.ts";
import { define } from "../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const form = await ctx.req.formData();
    const payload = { email: form.get("email") };
    const parsed = z.object({ email: z.string().email() }).safeParse(payload);
    const target = new URL(ctx.req.url);

    if (!parsed.success) {
      target.searchParams.set("error", "Please enter a valid email address.");
      target.searchParams.delete("status");
      return Response.redirect(target, 303);
    }

    const redirectTo = new URL("/auth/callback", ctx.req.url).toString();

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      parsed.data.email.toLowerCase(),
      { redirectTo },
    );

    if (error) {
      target.searchParams.set(
        "error",
        error.message || "Failed to send invitation.",
      );
      target.searchParams.delete("status");
      return Response.redirect(target, 303);
    }

    target.searchParams.set("status", "sent");
    target.searchParams.set("email", parsed.data.email.toLowerCase());
    target.searchParams.delete("error");
    return Response.redirect(target, 303);
  },
});

export default define.page(function RegisterPage(ctx) {
  const params = new URL(ctx.req.url).searchParams;
  const error = params.get("error");
  const status = params.get("status");
  const email = params.get("email");
  const inviteSent = status === "sent";

  const steps = (
    <ol class="progress-list">
      <li class={`progress-item ${inviteSent ? "complete" : ""}`}>
        <span class="progress-badge">1</span>
        <div class="progress-content">
          <p class="progress-title">Invitation Sent</p>
          <p class="progress-description">
            We email you a secure link to set a password.
          </p>
        </div>
      </li>
      <li class="progress-item">
        <span class="progress-badge">2</span>
        <div class="progress-content">
          <p class="progress-title">Set Password</p>
          <p class="progress-description">
            Follow the link to choose your credentials.
          </p>
        </div>
      </li>
      <li class="progress-item">
        <span class="progress-badge">3</span>
        <div class="progress-content">
          <p class="progress-title">Enroll MFA</p>
          <p class="progress-description">
            Scan the QR code and confirm a TOTP code.
          </p>
        </div>
      </li>
    </ol>
  );

  return (
    <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
      <Head>
        <title>Register</title>
      </Head>

      <StepLayout
        eyebrow="Step 1 · Invitation"
        title="Invite yourself to Proofmarked"
        intro="We will send you a single-use link to finish onboarding with a password and MFA enrollment."
        aside={steps}
      >
        {error && <Alert variant="danger">{error}</Alert>}

        {inviteSent
          ? (
            <div class="space-y-4">
              <Alert variant="success">
                Invitation sent to{" "}
                <strong>{email}</strong>. Check your inbox and follow the link
                within 24 hours.
              </Alert>
              <p class="text-sm text-gray-500 text-center">
                Not seeing the email? Look in spam or{" "}
                <a
                  href="/register"
                  class="text-black underline hover:no-underline"
                >
                  resend the invite
                </a>
                .
              </p>
            </div>
          )
          : (
            <form method="post" class="space-y-5">
              <div class="form-field">
                <label htmlFor="email">Work Email</label>
                <input
                  class="input"
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button class="btn btn-primary w-full" type="submit">
                Send secure invite
              </button>
              <p class="text-sm text-gray-500 text-center">
                Already have an account?{" "}
                <a
                  href="/login"
                  class="text-black underline hover:no-underline"
                >
                  Sign in
                </a>
              </p>
            </form>
          )}
      </StepLayout>
    </main>
  );
});
