import { Head } from "fresh/runtime";
import { DashboardNav } from "../components/DashboardNav.tsx";
import { Alert } from "../components/Alert.tsx";
import { define } from "../utils.ts";

export default define.page(function Dashboard(ctx) {
  const user = ctx.state.session?.user;

  return (
    <main class="px-6 lg:px-12 py-12 max-w-5xl mx-auto space-y-10">
      <Head>
        <title>Dashboard · Proofmarked</title>
      </Head>
      <DashboardNav userEmail={user?.email ?? ""} />
      <section class="card p-8 space-y-6">
        <h2 class="text-3xl font-semibold text-slate-900">
          Hello world, {user?.user_metadata?.full_name ?? user?.email}
        </h2>
        <p class="text-slate-600 text-lg">
          You have completed the entire onboarding journey. This placeholder
          dashboard is reachable only after enforcing password + MFA.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <Alert variant="success" title="Session assurance">
            All API responses are scoped to an AAL2 session. Revoke access at
            any time from Supabase or by logging out.
          </Alert>
          <Alert title="Next steps">
            Replace this view with your own dashboards or connect Supabase RLS
            policies that require{" "}
            <code>auth.jwt() -&gt;&gt; 'aal' = 'aal2'</code>.
          </Alert>
        </div>
      </section>
    </main>
  );
});
