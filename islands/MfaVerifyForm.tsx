import { useState } from "preact/hooks";
import { Alert } from "../components/Alert.tsx";

interface Props {
  factorId: string;
  factorLabel: string;
  initialChallengeId: string;
}

export default function MfaVerifyForm(
  { factorId, factorLabel, initialChallengeId }: Props,
) {
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "verifying">("idle");

  async function submit(event: Event) {
    event.preventDefault();
    setStatus("verifying");
    setError(null);

    const response = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factorId, challengeId, code }),
    });

    if (response.ok) {
      globalThis.location.href = "/dashboard";
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setError(payload.error ?? "Verification failed");
    setStatus("idle");
  }

  async function refreshChallenge() {
    const response = await fetch("/api/auth/mfa/challenge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factorId }),
    });
    if (response.ok) {
      const payload = await response.json();
      setChallengeId(payload.challengeId);
    }
  }

  return (
    <form class="space-y-5" onSubmit={submit}>
      <Alert variant="info">
        Challenge issued to{" "}
        <strong>{factorLabel}</strong>. Enter the latest 6-digit code below.
      </Alert>
      {error && <Alert variant="danger">{error}</Alert>}
      <div class="form-field">
        <label htmlFor="code">One-time code</label>
        <input
          id="code"
          name="code"
          class="input tracking-[0.5em] text-center text-2xl"
          inputMode="numeric"
          pattern="[0-9]{6}"
          placeholder="0 0 0 0 0 0"
          value={code}
          onInput={(event) => setCode((event.target as HTMLInputElement).value)}
          required
        />
      </div>
      <div class="flex gap-3">
        <button
          type="submit"
          class="btn btn-primary flex-1"
          disabled={status === "verifying"}
        >
          {status === "verifying" ? "Verifying..." : "Verify challenge"}
        </button>
        <button
          class="btn btn-secondary"
          type="button"
          onClick={refreshChallenge}
        >
          New code
        </button>
      </div>
    </form>
  );
}
