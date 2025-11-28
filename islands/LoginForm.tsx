import { useState } from "preact/hooks";
import { Alert } from "../components/Alert.tsx";

interface ChallengeState {
  factorId: string;
  challengeId: string;
  factorLabel: string;
}

export default function LoginForm() {
  const [status, setStatus] = useState<"idle" | "password" | "otp">("idle");
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [code, setCode] = useState("");

  async function handlePasswordSubmit(event: Event) {
    event.preventDefault();
    setStatus("password");
    setError(null);

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (response.status === 200) {
        globalThis.location.href = "/dashboard";
        return;
      }

      if (response.status === 202) {
        const payload = await response.json();
        setChallenge(payload);
        setStatus("otp");
        setCode("");
        setError(null);
        return;
      }

      if (response.status === 428) {
        const payload = await response.json();
        globalThis.location.href = payload.enrollUrl ?? "/mfa/setup";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Authentication failed.");
      setStatus("idle");
    } catch {
      setError("Network error. Check your connection and retry.");
      setStatus("idle");
    }
  }

  async function handleVerify(event: Event) {
    event.preventDefault();
    if (!challenge) return;
    setStatus("otp");
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          factorId: challenge.factorId,
          challengeId: challenge.challengeId,
          code,
        }),
      });

      if (response.ok) {
        globalThis.location.href = "/dashboard";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Invalid code. Please try again.");
    } catch {
      setError("Network error. Please retry.");
    } finally {
      setStatus("idle");
      const refreshResponse = await fetch("/api/auth/mfa/challenge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ factorId: challenge.factorId }),
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setChallenge({ ...challenge, challengeId: data.challengeId });
      }
    }
  }

  return (
    <div class="space-y-6">
      {error && <Alert variant="danger">{error}</Alert>}

      {!challenge && (
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
            {status === "password" ? "Checking..." : "Continue to MFA"}
          </button>
        </form>
      )}

      {challenge && (
        <form class="space-y-5" onSubmit={handleVerify}>
          <Alert variant="info">
            Enter the 6-digit code from {challenge.factorLabel}.
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
            />
          </div>
          <div class="flex gap-3">
            <button class="btn btn-primary flex-1" type="submit">
              {status === "otp" ? "Verifying..." : "Verify code"}
            </button>
            <button
              class="btn btn-secondary"
              onClick={(event) => {
                event.preventDefault();
                setChallenge(null);
                setStatus("idle");
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
