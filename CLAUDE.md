# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev       # Start Next.js dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

The backend API must be running at `http://localhost:5194` for the frontend to function.

## Architecture Overview

This is a Vietnamese retail POS/inventory management system built with **Next.js App Router**.

### Role-Based Routing

Two user roles with separate route trees, enforced by `proxy.ts` middleware:
- `/nhan-vien/*` — Employee routes (sales, imports, products, orders, promotions)
- `/chu-cua-hang/*` — Owner routes (same as employee + employee management + customers)

Unauthenticated users are redirected to `/dang-nhap`. Role mismatch redirects to the correct base path.

### Authentication

- JWT stored as `accessToken` cookie, decoded via `jose` in `proxy.ts`
- `app/userProvider.tsx` fetches the user profile on app mount and syncs it to Redux
- Axios client (`api/axiosClient.ts`) uses `withCredentials: true` for all requests

### State Management

Two layers work together:
- **Redux Toolkit** (`utilities/store.ts`) — client-side state: user session, alerts, barcode, product editing, sale cart items
- **TanStack React Query** — server state: data fetching, caching, and mutations

### API Layer

All API calls go through `api/axiosClient.ts` (base URL: `http://localhost:5194`). Each domain has its own file under `api/{domain}/`. Do not make `fetch` calls directly in components; use the API modules.

### Component Organization

- `components/Tables/` — domain-specific data tables
- `components/Forms/` — create/update forms, including `PromotionTypes/` subfolder for promotion variants
- `components/FormInputs/` — reusable input field components
- `components/Modal/` — modal dialogs
- `components/Sales/` — POS sale flow components

### Styling

Tailwind CSS v4 with Ant Design (`antd` v6) as the component library. Primary theme color is purple `#6420AA` / pink `#FF3EA5`, configured in `app/globals.css` and passed to Ant Design's `ConfigProvider` in `app/providers.tsx`. Use Tailwind utility classes for layout/spacing; use Ant Design components for interactive UI elements.

### Key Utilities

- `utilities/numberFormat.ts` — currency formatting
- `utilities/timeFormat.ts` — date/time helpers (uses `dayjs`)
- `utilities/session.ts` — JWT session helpers
- `utilities/image.ts` — image URL helpers
- `utilities/removeDiacritics.ts` — Vietnamese text normalization for search
- `const/routes.ts` — centralized route path constants for both roles

### TypeScript

Strict mode enabled. Type definitions live in `types/`. Use the existing interfaces in that folder; do not redefine types inline in components.
