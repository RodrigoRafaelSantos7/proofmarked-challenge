import { Head } from "fresh/runtime";
import LoginForm from "../islands/LoginForm.tsx";
import { StepLayout } from "../components/StepLayout.tsx";
import { define } from "../utils.ts";

export default define.page(function LoginPage() {
  const steps = (
    <ol class="progress-list">
      <li class="progress-item complete">
        <span class="progress-badge">1</span>
        <div class="progress-content">
          <p class="progress-title">Password</p>
          <p class="progress-description">
            Authenticate with your email and password.
          </p>
        </div>
      </li>
      <li class="progress-item">
        <span class="progress-badge">2</span>
        <div class="progress-content">
          <p class="progress-title">MFA Code</p>
          <p class="progress-description">
            Enter the 6-digit code from your authenticator.
          </p>
        </div>
      </li>
      <li class="progress-item">
        <span class="progress-badge">3</span>
        <div class="progress-content">
          <p class="progress-title">HelloWorld</p>
          <p class="progress-description">
            Access the protected dashboard session.
          </p>
        </div>
      </li>
    </ol>
  );

  return (
    <main class="px-6 lg:px-12 py-16 max-w-5xl mx-auto">
      <Head>
        <title>Sign In</title>
      </Head>

      <StepLayout
        eyebrow="Step 2 · Authentication"
        title="Sign in securely"
        intro="Every sign in enforces password + TOTP before issuing an AAL2 session."
        aside={steps}
      >
        <LoginForm />
        <p class="text-sm text-gray-500 text-center">
          Need an account?{" "}
          <a href="/register" class="text-black underline hover:no-underline">
            Request an invite
          </a>
        </p>
      </StepLayout>
    </main>
  );
});
