import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import AuthCallback from "../../islands/AuthCallback.tsx";
import { StepLayout } from "../../components/StepLayout.tsx";

export default define.page(function CallbackPage({ url }) {
  const errorParam = url.searchParams.get("error");

  return (
    <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
      <Head>
        <title>Set Your Password</title>
      </Head>
      <StepLayout
        eyebrow="Step 2 · Credentialing"
        title="Create a strong password"
        intro="This page finalizes your invitation. Tokens are validated client-side before we send your new password to the API."
        aside={
          <ol class="progress-list">
            <li class="progress-item complete">
              <span class="progress-badge">1</span>
              <div class="progress-content">
                <p class="progress-title">Validate Link</p>
                <p class="progress-description">
                  We read the Supabase invite tokens from the URL hash.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">2</span>
              <div class="progress-content">
                <p class="progress-title">Set Password</p>
                <p class="progress-description">
                  Choose an 8+ character password we update via the API.
                </p>
              </div>
            </li>
            <li class="progress-item">
              <span class="progress-badge">3</span>
              <div class="progress-content">
                <p class="progress-title">Enroll MFA</p>
                <p class="progress-description">
                  We redirect you to the QR setup after success.
                </p>
              </div>
            </li>
          </ol>
        }
      >
        <AuthCallback serverError={errorParam} />
      </StepLayout>
    </main>
  );
});
