interface DashboardNavProps {
  userEmail?: string;
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  return (
    <header class="w-full flex items-center justify-between py-6 border-b border-black">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-gray-500">
          Proofmarked
        </p>
        <h1 class="text-xl font-medium text-black">
          Secure Workforce Console
        </h1>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Signed in</p>
          <p class="text-sm font-medium text-black">
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
