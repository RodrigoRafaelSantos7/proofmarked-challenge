import { useEffect, useRef, useState } from "preact/hooks";
import { Alert } from "../components/Alert.tsx";

type Status = "loading" | "ready" | "submitting" | "error";

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface AuthCallbackProps {
  serverError?: string | null;
}

export default function AuthCallback({ serverError }: AuthCallbackProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(serverError || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const hash = globalThis.location.hash;
    if (!hash || !hash.includes("access_token")) {
      if (serverError) {
        setError(serverError);
        setStatus("error");
        return;
      }
      setError("Invalid or expired link. Please request a new invitation.");
      setStatus("error");
      return;
    }

    const hashContent = hash.substring(1);
    const params = new URLSearchParams(hashContent);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setError("Invalid authentication tokens.");
      setStatus("error");
      return;
    }

    setTokens({ accessToken, refreshToken });
    setStatus("ready");

    if (serverError) {
      setError(serverError);
    }
  }, [serverError]);

  function handleSubmit(event: Event) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!tokens) {
      setError("Invalid authentication tokens.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    if (formRef.current) {
      formRef.current.submit();
    }
  }

  if (status === "loading") {
    return (
      <div class="text-center py-8">
        <p class="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "error" && !error?.includes("Password")) {
    return (
      <div class="space-y-4">
        <Alert variant="danger">{error}</Alert>
        <a href="/register" class="btn btn-primary w-full text-center">
          Request New Invitation
        </a>
      </div>
    );
  }

  return (
    <>
      <form
        ref={formRef}
        method="POST"
        action="/api/auth/set-password"
        style={{ display: "none" }}
      >
        <input
          type="hidden"
          name="accessToken"
          value={tokens?.accessToken || ""}
        />
        <input
          type="hidden"
          name="refreshToken"
          value={tokens?.refreshToken || ""}
        />
        <input type="hidden" name="password" value={password} />
      </form>

      <form class="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <div class="form-field">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            class="input"
            placeholder="At least 8 characters"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
            minLength={8}
            disabled={status === "submitting"}
          />
        </div>

        <div class="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            class="input"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onInput={(e) =>
              setConfirmPassword((e.target as HTMLInputElement).value)}
            required
            minLength={8}
            disabled={status === "submitting"}
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Setting password..." : "Set Password"}
        </button>
      </form>
    </>
  );
}
