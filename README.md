# Proofmarked Challenge

This app is built with [Fresh](https://fresh.deno.dev) and Supabase. Follow the
steps below to get it running locally.

## Prerequisites

- Install Deno v1.43+ from https://docs.deno.com/runtime/getting_started/installation
- Have a Supabase project handy so you can copy its API keys
- (Optional) Install the Supabase CLI if you want to inspect auth data locally

## Environment variables

The app reads the following variables via `requireEnv` in `lib/env.ts`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Create a `.env` file in the project root with the values from the Supabase
dashboard:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

You can also copy from the snippet above with `cp .env.example .env` after
pasting it into a local `.env.example` file.

## Running locally

1. `deno task dev`
2. Open http://localhost:8000 (Vite will hot-reload on file changes)

Deno will download/import npm dependencies on demand, so you do not need to run
`npm install`.

## Useful tasks

- `deno task check` — format, lint, and type-check everything
- `deno task build` — build the production bundle (`_fresh/`)
- `deno task start` — serve the built app (`deno task build` first)

## Troubleshooting

- Missing env vars: the app throws `Missing required env var` if any of the
  Supabase keys are absent; double-check `.env`.
- Wrong Supabase URL or key scopes lead to auth failures; verify them in the
  Supabase dashboard's API settings.
- Port already in use: set `PORT=XXXX deno task dev` to bind to another port.
