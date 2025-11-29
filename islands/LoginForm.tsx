import { useState } from "preact/hooks";
import { Alert } from "../components/Alert.tsx";

interface TempTokens {
  accessToken: string;
  refreshToken: string;
}

interface MfaState {
  factorId: string;
  factorLabel: string;
  tempTokens: TempTokens;
}

export default function LoginForm() {
  const [status, setStatus] = useState<"idle" | "password" | "otp">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mfaState, setMfaState] = useState<MfaState | null>(null);
  const [code, setCode] = useState("");

  async function handlePasswordSubmit(event: Event) {
    event.preventDefault();
    setStatus("password");
    setError(null);

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Email and password are required.");
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = await response.json();

      if (response.status === 200) {
        if (payload.needsEnrollment) {
          globalThis.location.href = payload.redirectTo ?? "/mfa/setup";
          return;
        }
        globalThis.location.href = payload.redirectTo ?? "/dashboard";
        return;
      }

      if (response.status === 202) {
        setMfaState({
          factorId: payload.factorId,
          factorLabel: payload.factorLabel,
          tempTokens: payload.tempTokens,
        });
        setStatus("otp");
        setCode("");
        setError(null);
        return;
      }

      setError(payload.error ?? "Authentication failed.");
      setStatus("idle");
    } catch {
      setError("Network error. Check your connection and retry.");
      setStatus("idle");
    }
  }

  async function handleVerify(event: Event) {
    event.preventDefault();
    if (!mfaState) return;
    setStatus("otp");
    setError(null);

    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          factorId: mfaState.factorId,
          code,
          tempTokens: mfaState.tempTokens,
        }),
      });

      if (response.ok) {
        globalThis.location.href = "/dashboard";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Invalid code. Please try again.");
      setStatus("idle");
    } catch {
      setError("Network error. Please retry.");
      setStatus("idle");
    }
  }

  function handleStartOver() {
    setMfaState(null);
    setStatus("idle");
    setError(null);
    setCode("");
  }

  return (
    <div class="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      {!mfaState && (
        <form class="space-y-5" onSubmit={handlePasswordSubmit}>
          <div class="form-field">
            <label htmlFor="email">Email</label>
            <input
              class="input"
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@proofmarked.dev"
              disabled={status === "password"}
            />
          </div>
          <div class="form-field">
            <label htmlFor="password">Password</label>
            <input
              class="input"
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              disabled={status === "password"}
            />
          </div>
          <button
            class="btn btn-primary w-full"
            disabled={status === "password"}
            type="submit"
          >
            {status === "password" ? "Signing in..." : "Sign in"}
          </button>
        </form>
      )}

      {mfaState && (
        <form class="space-y-5" onSubmit={handleVerify}>
          <Alert variant="info">
            Enter the 6-digit code currently shown in {mfaState.factorLabel}.
          </Alert>
          <div class="form-field">
            <label htmlFor="code">One-time code</label>
            <input
              id="code"
              name="code"
              class="input tracking-[0.5em] text-center text-xl"
              placeholder="0 0 0 0 0 0"
              value={code}
              onInput={(event) =>
                setCode((event.target as HTMLInputElement).value)}
              required
              autoFocus
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
            />
          </div>
          <div class="flex gap-3">
            <button
              class="btn btn-primary flex-1"
              type="submit"
              disabled={status === "otp" || code.length !== 6}
            >
              {status === "otp" ? "Verifying..." : "Verify code"}
            </button>
            <button
              class="btn btn-secondary"
              onClick={(event) => {
                event.preventDefault();
                handleStartOver();
              }}
              type="button"
            >
              Start over
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
