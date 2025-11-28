import { Head } from "fresh/runtime";
import { z } from "zod";
import { StepLayout } from "../components/StepLayout.tsx";
import { FormActions, FormField } from "../components/Form.tsx";
import { Alert } from "../components/Alert.tsx";
import { supabaseAdmin } from "../lib/supabase.ts";
import { define } from "../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const form = await ctx.req.formData();
    const payload = {
      email: form.get("email"),
    };
    const parsed = z.object({ email: z.string().email() }).safeParse(payload);
    const target = new URL(ctx.req.url);

    if (!parsed.success) {
      target.searchParams.set("error", "Please enter a valid email address.");
      target.searchParams.delete("status");
      return Response.redirect(target, 303);
    }

    const redirectTo = new URL("/login", ctx.req.url).toString();
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      parsed.data.email.toLowerCase(),
      {
        data: { mfa_enforced: true },
        redirectTo,
      },
    );

    if (error) {
      target.searchParams.set("error", "Invite failed. Try again shortly.");
      target.searchParams.delete("status");
      return Response.redirect(target, 303);
    }

    target.searchParams.set("status", "sent");
    target.searchParams.delete("error");
    return Response.redirect(target, 303);
  },
});

export default define.page(function RegisterPage(ctx) {
  const params = new URL(ctx.req.url).searchParams;
  const error = params.get("error");
  const status = params.get("status");

  return (
    <main class="px-6 lg:px-12 py-16 max-w-4xl mx-auto space-y-12">
      <Head>
        <title>Invite a teammate · Proofmarked</title>
      </Head>

      <StepLayout
        eyebrow="Step 1 · Invitation"
        title="Invite a teammate"
        intro="We’ll send them a Supabase-powered email to set their password and require MFA before their first login."
        aside={
          <div class="space-y-3 text-sm text-slate-600">
            <p class="font-semibold text-slate-900">
              What happens after sending?
            </p>
            <ol class="space-y-2 list-decimal list-inside">
              <li>User receives invite link from Supabase.</li>
              <li>They choose a strong password.</li>
              <li>They’re redirected back here to complete MFA.</li>
            </ol>
          </div>
        }
      >
        <form method="post" class="space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}
          {status === "sent" && (
            <Alert variant="success">
              Invite sent! The recipient has ten minutes to set their password
              before the link expires.
            </Alert>
          )}
          <FormField
            label="Work email"
            htmlFor="email"
            hint="We only allow company domains, so aliases and personal inboxes are blocked."
          >
            <input
              class="input"
              id="email"
              name="email"
              type="email"
              required
              placeholder="teammate@proofmarked.dev"
            />
          </FormField>
          <FormActions
            primary={
              <button class="btn btn-primary" type="submit">
                Send invitation
              </button>
            }
            secondary={
              <a class="btn btn-secondary" href="/login">
                I already have an invite
              </a>
            }
          />
        </form>
      </StepLayout>
    </main>
  );
});
