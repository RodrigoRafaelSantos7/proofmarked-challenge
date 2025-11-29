# Secure Authentication with MFA

Production-ready authentication journey with mandatory MFA (Multi-Factor
Authentication) using Fresh 2.0, Deno, and Supabase.

## Features

- Email-based registration with invitation links
- Password setup via secure callback
- Mandatory TOTP MFA enrollment
- Protected dashboard requiring AAL2 (password + MFA)

## Prerequisites

1. **Deno** - Install from
   https://docs.deno.com/runtime/getting_started/installation
2. **Supabase Project** - Create one at https://supabase.com

## Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Set **Site URL** to: `http://localhost:5173`
4. Add to **Redirect URLs**: `http://localhost:5173/auth/callback`
5. Navigate to **Authentication → MFA**
6. Enable **TOTP** (Time-based One-Time Password)

## Environment Setup

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
COOKIE_SECURE=false
```

Get these values from your Supabase dashboard under **Settings → API**.

## Running Locally

Start the dev server:

```bash
deno task dev
```

This runs Vite in development mode. Once compiled, visit http://localhost:5173
in your browser.

## User Journeys

### New teammates

1. **Register** (`/register`) – capture an email and send a Supabase invite
2. **Set password** (`/auth/callback`) – validate tokens client-side, submit to
   `/api/auth/set-password`
3. **Enroll MFA** (`/mfa/setup`) – enforce QR scan + verification before issuing
   AAL2 cookies
4. **Dashboard** (`/dashboard`) – HelloWorld experience gated by middleware

### Returning teammates

1. **Login** (`/login`) – password auth via `/api/auth/login`
2. **MFA verify** (`/mfa/verify`) – just-in-time challenge/verify using
   `/api/auth/mfa/verify`
3. **Dashboard** – only available with valid AAL2 session tokens

## Project Structure

```
routes/
├── index.tsx          # Landing page
├── register.tsx       # Registration form
├── login.tsx          # Login form
├── dashboard.tsx      # Protected dashboard
├── auth/
│   └── callback.tsx   # Password setup after invite
├── mfa/
│   ├── setup.tsx      # MFA enrollment
│   └── verify.tsx     # MFA verification
└── api/auth/
    ├── login.ts       # Login API
    ├── logout.ts      # Logout API
    ├── set-password.ts # Password setup API
    └── mfa/
        ├── verify.ts  # MFA verify API
        └── challenge.ts # MFA challenge API
```
