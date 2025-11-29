import { Head } from "fresh/runtime";
import { Alert } from "../components/Alert.tsx";
import { DashboardNav } from "../components/DashboardNav.tsx";
import { define } from "../utils.ts";

export default define.page(function Dashboard(ctx) {
  const user = ctx.state.session?.user;

  return (
    <main class="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-8">
      <Head>
        <title>HelloWorld Dashboard</title>
      </Head>

      <DashboardNav userEmail={user?.email ?? undefined} />

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="card p-8 space-y-4">
          <p class="eyebrow">HelloWorld</p>
          <h2 class="text-3xl font-medium text-black">
            Welcome back, {user?.email?.split("@")[0] ?? "operator"}
          </h2>
          <p class="text-gray-600">
            You are now inside the protected dashboard. This is where we would
            surface workforce signals, but for the demo we simply confirm your
            AAL2 session.
          </p>
          <Alert variant="success" title="Session hardened">
            Password + TOTP verified moments ago. Tokens are stored in HTTP-only
            cookies and enforced by middleware on every request.
          </Alert>
        </section>

        <section class="card p-8 space-y-4">
          <p class="eyebrow">Account snapshot</p>
          <dl class="space-y-3">
            <div>
              <dt class="text-xs uppercase tracking-wide text-gray-500">
                Email
              </dt>
              <dd class="text-sm text-black">{user?.email}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-gray-500">
                User ID
              </dt>
              <dd class="text-sm text-black">{user?.id}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-gray-500">
                MFA status
              </dt>
              <dd class="text-sm text-black">Verified TOTP</dd>
            </div>
          </dl>
          <form action="/api/auth/logout" method="post">
            <button type="submit" class="btn btn-secondary w-full">
              Sign out
            </button>
          </form>
        </section>
      </div>
    </main>
  );
});
