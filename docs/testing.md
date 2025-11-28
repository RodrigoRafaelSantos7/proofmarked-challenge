# Manual test plan

## Environment

Create a `.env` file before running `deno task dev`:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# Optional: force secure cookies (defaults on in deploy)
COOKIE_SECURE=false
```

All values come from your Supabase project settings. The service key must stay
on the server; never expose it to the browser.

## Flows

1. **Registration**
   1. Visit `/register`.
   2. Submit a valid email address.
   3. Confirm that the success banner appears and Supabase sends the invite.

2. **Password + MFA enrollment**
   1. Use the invite email to set a password; you should land back on `/login`.
   2. Login once with email + password; you should be redirected to
      `/mfa/setup`.
   3. Scan the QR code, enter the OTP, and verify. You should land on
      `/dashboard`.

3. **Login with MFA challenge**
   1. Sign out.
   2. Go back to `/login`, enter credentials, and supply the OTP inline.
   3. You should land on `/dashboard`. Hitting `/dashboard` again without OTP
      should work until logout.

4. **Session guard**
   1. Try to hit `/dashboard` directly without a session — expect a redirect to
      `/login`.
   2. Login but skip entering the OTP — expect to be redirected to `/mfa/verify`
      until you complete the challenge.
