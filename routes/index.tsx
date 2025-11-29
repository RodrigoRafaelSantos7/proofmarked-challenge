import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Landing() {
  return (
    <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto space-y-12">
      <Head>
        <title>Proofmarked · Secure Auth</title>
      </Head>

      <section class="space-y-6 text-center">
        <p class="eyebrow">Fresh + Supabase</p>
        <h1 class="text-4xl font-medium text-black">
          Production-grade auth with mandatory MFA
        </h1>
        <p class="text-base text-gray-600 max-w-2xl mx-auto">
          Experience the full journey: invitation, password creation, MFA
          enrollment, and an authenticated HelloWorld dashboard. Built with
          Fresh, Deno, and Supabase Auth.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/register" class="btn btn-primary">
            Start onboarding
          </a>
          <a href="/login" class="btn btn-secondary">
            Already invited? Sign in
          </a>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-2">
        <div class="card p-8 space-y-5">
          <p class="eyebrow">New teammates</p>
          <h2 class="text-2xl font-medium text-black">Invitation flow</h2>
          <ol class="progress-list">
            <li class="progress-item complete">
              <span class="progress-badge">1</span>
              <div class="progress-content">
                <p class="progress-title">Register</p>
                <p class="progress-description">
                  Collect an email and send the Supabase invite.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">2</span>
              <div class="progress-content">
                <p class="progress-title">Password setup</p>
                <p class="progress-description">
                  Validate the invite tokens and set credentials.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">3</span>
              <div class="progress-content">
                <p class="progress-title">MFA enrollment</p>
                <p class="progress-description">
                  Enforce QR scanning + verification before dashboard.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div class="card p-8 space-y-5">
          <p class="eyebrow">Returning teammates</p>
          <h2 class="text-2xl font-medium text-black">Login flow</h2>
          <ol class="progress-list">
            <li class="progress-item complete">
              <span class="progress-badge">1</span>
              <div class="progress-content">
                <p class="progress-title">Password</p>
                <p class="progress-description">
                  Supabase password auth via edge API route.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">2</span>
              <div class="progress-content">
                <p class="progress-title">MFA challenge</p>
                <p class="progress-description">
                  Just-in-time challenge + verify using TOTP.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">3</span>
              <div class="progress-content">
                <p class="progress-title">HelloWorld dashboard</p>
                <p class="progress-description">
                  Middleware enforces AAL2 before serving content.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
});
