import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Landing() {
  return (
    <main class="px-6 lg:px-12 py-16 max-w-6xl mx-auto space-y-16">
      <Head>
        <title>Proofmarked · Zero-Trust onboarding</title>
        <meta
          name="description"
          content="Fresh + Supabase reference implementation for mandatory MFA onboarding."
        />
      </Head>

      <section class="flex flex-col lg:flex-row items-center gap-12">
        <div class="space-y-6 flex-1">
          <p class="eyebrow">Secure Workforce Platform</p>
          <h1 class="text-5xl font-semibold leading-tight text-slate-900">
            Onboard every teammate with password + mandatory MFA in minutes.
          </h1>
          <p class="text-lg text-slate-600 max-w-2xl">
            This reference app uses Fresh 2, Supabase Auth, and Vite tooling to
            demonstrate an end-to-end onboarding flow: invitations, password
            creation, MFA enrollment, and a gated dashboard.
          </p>
          <div class="flex flex-wrap gap-4">
            <a class="btn btn-primary" href="/register">
              Send an invite
            </a>
            <a class="btn btn-secondary" href="/login">
              I already have access
            </a>
          </div>
        </div>
        <div class="card p-8 flex-1 space-y-4">
          <p class="text-sm uppercase tracking-[0.4em] text-slate-400">
            Journey overview
          </p>
          <ol class="space-y-3">
            <li>
              <span class="font-semibold text-slate-900">1. Register</span>
              <p class="text-slate-500 text-sm">
                Admin invite triggers Supabase email with password setup link.
              </p>
            </li>
            <li>
              <span class="font-semibold text-slate-900">2. Enroll MFA</span>
              <p class="text-slate-500 text-sm">
                Users must scan the QR code and confirm TOTP before continuing.
              </p>
            </li>
            <li>
              <span class="font-semibold text-slate-900">3. Access</span>
              <p class="text-slate-500 text-sm">
                Login enforces MFA challenge on every session before dashboard.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
});
