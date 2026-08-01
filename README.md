# SecureSlot — Frontend

Next.js frontend for **SecureSlot**, a concurrency-safe clinic appointment booking system. This repo is the client for [`secureslot-backend`](https://github.com/Raghavtripathii/secureslot-backend) (FastAPI + PostgreSQL), which handles auth, RBAC, and the row-locked booking logic that actually prevents double-booking.

Live: [secureslot-frontend.vercel.app](https://secureslot-frontend.vercel.app)
Backend API: [secureslot-backend.onrender.com](https://secureslot-backend.onrender.com)

## A note on the live demo

The backend runs on Render's free tier, which sleeps after ~15 minutes
of inactivity. The first request after a period of inactivity can take
30–60 seconds to respond while the container wakes up — this shows up
as the login/register pages appearing to hang briefly, not a bug.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **TanStack Query** for server state (doctors list, appointments list, booking mutation)
- **Tailwind CSS 4** for styling
- No component library, no design system — plain Tailwind utility classes throughout

## Auth architecture

The backend issues a JWT on login. This frontend never lets that token reach client-side JavaScript.

Instead:

1. The browser posts credentials to a **Next.js Route Handler** (`app/api/auth/login/route.ts`), not directly to the FastAPI backend.
2. The route handler calls the backend server-side, gets the JWT back, and sets it as an **httpOnly, `secure`, `sameSite=lax`** cookie (`lib/session.ts`). `secure` is conditional on `NODE_ENV === "production"` so it still works over plain HTTP in local dev.
3. Every subsequent authenticated request (`/api/doctors`, `/api/appointments`) also goes through a route handler, which reads the cookie server-side and forwards it to the backend as an `Authorization: Bearer <token>` header.

The point of this indirection: client-side JS — and therefore any XSS payload that runs in the page — never has access to the token. The backend also never sees the cookie itself, only a normal bearer header, so there's no cookie-based CSRF surface against the FastAPI API directly.

**Tradeoffs, stated plainly:**

- The cookie's `maxAge` is hardcoded to 30 minutes to match the backend's token expiry. There's no refresh token flow — when the token expires, the user is simply logged out and has to log in again. No silent refresh, no "session extension."
- `middleware.ts` only checks whether the `secureslot_token` cookie is *present*, not whether it's expired or valid. An expired-but-unexpired-cookie will pass middleware and let the user reach `/dashboard`, `/book`, etc. — the actual 401 only surfaces when a page tries to fetch data through a route handler. This means real auth enforcement lives at the API-call layer, and middleware is only a redirect-for-UX convenience, not the security boundary.
- Real validation of the JWT (signature, expiry) happens on the backend, not in the middleware. That's intentional — the frontend has no business decoding or trusting a token it can't verify — but it does mean the middleware is not a substitute for backend auth checks, only a UX shortcut.

## Pages

| Route | Access | Notes |
|---|---|---|
| `/` | public | Immediately redirects to `/login` |
| `/register` | public | Patient or doctor role selection at signup |
| `/login` | public | Email + password |
| `/dashboard` | protected | Two links: book an appointment, view my appointments |
| `/book` | protected | Doctor picker (from `GET /api/doctors`) + datetime picker, shows the live 201/409 response from the booking mutation |
| `/appointments` | protected | Lists the logged-in user's appointments |

"Protected" is enforced by `middleware.ts` matching on `/dashboard/:path*`, `/book/:path*`, `/appointments/:path*`.

## The interesting part: watching the race condition from the UI

`/book` intentionally surfaces the backend's concurrency control instead of hiding it. Every booking attempt shows the raw HTTP status inline — `201` on success, `409` if the slot is already taken. Booking the same doctor/time twice in a row is a fast way to see the backend's `SELECT FOR UPDATE` + `UniqueConstraint(doctor_id, start_time)` logic reject the second request live, rather than just reading about it in the backend's test suite.

Appointment duration is fixed at 30 minutes client-side (`start_time` + 30 min = `end_time`) — there's no UI for variable-length appointments yet.

## Project structure

    app/
      api/
        auth/login/route.ts       # proxies to POST /auth/login, sets httpOnly cookie
        auth/logout/route.ts      # clears the cookie
        auth/register/route.ts    # proxies to POST /auth/register
        doctors/route.ts          # proxies to GET /doctors/, requires cookie
        appointments/route.ts     # proxies to GET /appointments/me and POST /appointments/
      login/page.tsx
      register/page.tsx
      dashboard/page.tsx
      book/page.tsx
      appointments/page.tsx
      layout.tsx                  # wraps app in Providers + NavBar
      providers.tsx                # TanStack QueryClientProvider
    components/
      NavBar.tsx
    lib/
      session.ts                  # cookie get/set/clear helpers
    middleware.ts                 # route protection by cookie presence
    types/
      index.ts                    # User, Doctor, Appointment types (mirrors backend schemas)

## Environment variables

| Variable | Used by | Example |
|---|---|---|
| `BACKEND_URL` | all route handlers, server-side only | `https://secureslot-backend.onrender.com` |

`BACKEND_URL` is read server-side inside route handlers (`process.env.BACKEND_URL`), never exposed to the client — it's deliberately **not** prefixed with `NEXT_PUBLIC_`, since the browser has no reason to know the backend's address; it only ever talks to this app's own `/api/*` routes.

## Running locally

```bash
git clone git@github.com-raghav:Raghavtripathii/secureslot-frontend.git
cd secureslot-frontend
npm install
```

Create `.env.local`:

```
BACKEND_URL=http://localhost:8000
```

(point this at wherever your local `secureslot-backend` is running — see that repo's README for setup)

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Deployment

Deployed on **Vercel**, pointed at this repo's `main` branch. The only required config beyond defaults is setting `BACKEND_URL` in the Vercel project's Environment Variables to the live Render backend URL. Vercel was chosen for the frontend the same reason Render/Neon/Upstash were chosen for the backend over AWS — no card-based identity verification required to deploy.

## Known limitations / not done yet

Being upfront about what this repo does *not* have, rather than implying it does:

- **No automated tests.** The backend has pytest + a k6 load test proving the concurrency guarantees; this frontend has none — no component tests, no e2e tests (Playwright/Cypress), nothing in CI. If you're evaluating this project's rigor, that rigor lives entirely in the backend repo right now.
- **No CI pipeline** for this repo (the backend has GitHub Actions with a real Postgres service container; this repo has no `.github/workflows` at all).
- **No client-side form validation beyond HTML5 `required`.** Password strength, email format edge cases, etc. are left entirely to the backend to reject.
- **No loading/error boundary strategy beyond basic `isLoading`/`error` checks** from TanStack Query — no retry UI, no skeleton states, no global error boundary.
- **No admin UI.** The backend has an `admin` role in its RBAC; this frontend has no surface for it — `types/index.ts` defines `UserRole` including `"admin"`, but no admin-only pages or actions exist.
- **No doctor-facing UI.** Doctors can register with the `doctor` role, but there's no doctor dashboard for managing their own schedule or viewing their appointments — the only appointments view (`/appointments`) is written for a patient's "my bookings" list.
- **Session UX is abrupt.** As noted above, no refresh-token flow means users get hard-logged-out every 30 minutes with no warning.

## License

Copyright © 2026 Raghvendra Tripathi. This project is licensed under the
[MIT License](./LICENSE) — free to use, modify, and distribute with
attribution.