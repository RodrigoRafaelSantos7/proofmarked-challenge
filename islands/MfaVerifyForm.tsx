import { useState } from "preact/hooks";
import { Alert } from "../components/Alert.tsx";

interface Props {
  factorId: string;
  factorLabel: string;
  initialChallengeId?: string;
}

export default function MfaVerifyForm({ factorId, factorLabel }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "verifying">("idle");

  async function handleSubmit(event: Event) {
    event.preventDefault();
    setStatus("verifying");
    setError(null);

    try {
      const response = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ factorId, code }),
      });

      if (response.ok) {
        globalThis.location.href = "/dashboard";
        return;
      }

      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Invalid code. Please try again.");
      setStatus("idle");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <form class="space-y-5" onSubmit={handleSubmit}>
      <Alert variant="info">
        We issued a fresh challenge for{" "}
        {factorLabel}. Enter the current code before it rotates.
      </Alert>
      {error && <Alert variant="danger">{error}</Alert>}

      <div class="form-field">
        <label htmlFor="code">6-Digit Code</label>
        <input
          id="code"
          name="code"
          class="input tracking-[0.5em] text-center text-xl"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onInput={(e) => setCode((e.target as HTMLInputElement).value)}
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full"
        disabled={status === "verifying" || code.length !== 6}
      >
        {status === "verifying" ? "Verifying..." : "Verify"}
      </button>

      <p class="text-sm text-gray-500 text-center">
        <a href="/login" class="text-black underline hover:no-underline">
          Sign out
        </a>
      </p>
    </form>
  );
}
