<<<<<<< HEAD
# Early_N Platform

Early_N is the full-stack codebase for Early-N, an ethical investment platform that connects investors with mission-aligned investees and gives superadmins a centralized operations console.

## Overall Summary

The platform supports investor and investee onboarding, KYC, pitch/list management, search, saved pitches, subscription payments, messaging, meeting schedules, support conversations, notifications, reporting, moderation, analytics, and superadmin management.



## Documentation Index

- `normas/README.md` - frontend setup, environment, scripts, architecture, deployment
- `Normas-Backend/README.md` - backend setup, environment, route map, auth, deployment
- `Normas-Backend/docs/admin-users-api-integration.md`
- `Normas-Backend/docs/investment-conversations-postman.md`
- `Normas-Backend/docs/pricing-subscriptions-postman.md`
- `Normas-Backend/docs/schedule-api-integration.md`

=======
# Normas Frontend

Normas is the Next.js frontend for Early-N, an ethical investment platform that connects impact-driven investors with investees and gives superadmins tools to operate the marketplace.

## What This App Provides

- Public marketing and informational pages.
- Investor and investee authentication flows.
- Investor dashboard for search, saved pitches, messaging, schedules, profile, support, and subscriptions.
- Investee dashboard for KYC, pitch creation, created-list management, messaging, schedules, profile, support, and subscriptions.
- Superadmin console for analytics, users, lists, moderation, payments, reports, schedules, settings, FAQ, support, and legal content.
- Real-time messaging and notification support through Socket.IO.
- Stripe checkout integration for subscription upgrades.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Axios
- Zustand
- Socket.IO client
- Hugeicons

## Project Structure

```text
src/app/                 App Router pages and route handlers
src/components/          Shared, dashboard, auth, superadmin, and site UI
src/lib/                 API clients, auth/session helpers, socket config
public/                  Logos, images, and static assets
scripts/                 Local development helper scripts
```

## Requirements

- Node.js 24 recommended, matching the Dockerfile
- npm
- A running Normas-Backend API

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1/
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

Notes:

- `NEXT_PUBLIC_API_BASE_URL` must include `/api/v1/`.
- If `NEXT_PUBLIC_API_BASE_URL` is missing, development falls back to `http://localhost:5000/api/v1/` and production falls back to `https://api.early-n.com/api/v1/`.
- `NEXT_PUBLIC_SOCKET_URL` can be omitted if it uses the same origin as `NEXT_PUBLIC_API_BASE_URL`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful local routes:

- `/login`
- `/signup`
- `/dashboard`
- `/investee-dashboard`
- `/superadmin/auth/login`
- `/superadmin/dashboard`

## Scripts

```bash
npm run dev      # Start Next.js development server
npm run build    # Create production build
npm run start    # Start production server after build
npm run lint     # Run ESLint
```

## API Integration

All backend calls go through API wrappers in `src/lib`.

Common clients:

- `api.ts` - Axios instance, auth token injection, refresh handling
- `auth-api.ts` - signup, signin, OTP, password reset
- `list-api.ts` - pitch/list operations
- `kyc-api.ts` - KYC submission and review data
- `pricing-api.ts` and `subscription-api.ts` - plans, checkout, subscriptions
- `investment-conversations-api.ts` - conversations, messages, meeting requests
- `superadmin-analytics-api.ts` - admin dashboard analytics
- `admin-users-api.ts` - superadmin user management
- `moderation-api.ts`, `report-api.ts`, `support-api.ts`, `schedule-api.ts`, `notification-api.ts`

## Assets

Primary branding assets live in `public/`.

- `logo.svg` - main business logo
- `footer-logo.svg` - light/inverted logo
- `title-logo.svg` - browser tab icon

## Docker

Build-time public variables are passed through Docker args:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1/ \
  --build-arg NEXT_PUBLIC_SOCKET_URL=http://localhost:5000 \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key \
  -t normas-frontend .
```

Run:

```bash
docker run -p 3000:3000 normas-frontend
```

## Deployment Notes

- The app uses Next.js standalone output.
- Public environment variables are baked into the client build, so production values must be present at build time.
- Remote image loading is configured for the S3 profile and list image paths in `next.config.ts`.

## Quality Checks

Before shipping changes:

```bash
npm run lint
npm run build
```
>>>>>>> 2c4ce94 (slow issue resolv3e)
