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

