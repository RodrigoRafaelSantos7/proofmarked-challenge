interface DashboardNavProps {
  userEmail?: string;
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  return (
    <header class="w-full flex items-center justify-between py-6">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-slate-500">
          Proofmarked
        </p>
        <h1 class="text-2xl font-semibold text-slate-900">
          Secure Workforce Console
        </h1>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm text-slate-500">Signed in</p>
          <p class="text-base font-medium text-slate-800">
            {userEmail ?? "—"}
          </p>
        </div>
        <form method="post" action="/api/auth/logout">
          <button class="btn btn-secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
