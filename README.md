# TechBros Network

Tech freelancer showcase and client discovery platform.

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Setup

1. Clone and install:

   ```sh
   npm i
   ```

2. Copy environment template and set your Supabase keys:

   ```sh
   cp .env.example .env
   ```

   Edit `.env` with your Supabase URL and anon (publishable) key.

## Development

```sh
npm run dev
```

## Build (production)

```sh
npm run build
```

Output is in `dist/`. Deploy that folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (no source maps)
- `npm run preview` — preview production build locally
- `npm run lint` — ESLint
- `npm run test` — run tests
