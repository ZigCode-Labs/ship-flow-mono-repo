## Ship Flow UI — Auth & UI Overview

This document summarizes the current implementation of the authentication screens and core client utilities for manager review. It covers the registration and login flows, state management, form validations, and theming.

### 1) Register page

- **File**: `src/app/register/page.tsx`
- **Purpose**: Account creation with full name, email, phone, and password.
- **Fields**
  - **Full Name**: required, min 2 chars.
  - **Email**: required, RFC-compliant.
  - **Phone**: required, 6–20 chars, digits plus `+ ( ) -` and spaces.
  - **Password**: required, min 12 chars; confirm must match.
- **UX**
  - Centered card layout with title/subtitle and a “What you’ll get” section.
  - Show/Hide toggles for password and confirm password.
  - Inline error messages and disabled submit state while submitting.
  - Post-success, navigates to `"/login"` (or home when an API token is returned).
- **API**
  - Endpoint: `POST /auth/register`
  - Payload: `{ fullName, email, phone, password }`
  - On success with token: token + user are stored, then redirect to `/`.
  - On success without token: success message and redirect to `/login`.

### 2) Login page

- **File**: `src/app/login/page.tsx`
- **Fields**
  - **Email**: required, valid email.
  - **Password**: required, min 6 chars.
- **API**
  - Endpoint: `POST /auth/login`
  - Payload: `{ email, password }`
  - Response: `{ token, user? }`; persists token/user to auth store and routes to `/`.
- **UX**
  - Compact centered form with inline errors and disabled state while submitting.
  - Link to registration screen.

### 3) State management

- **Library**: [`zustand`](https://github.com/pmndrs/zustand) with `persist` middleware.
- **File**: `src/store/auth.ts`
- **Shape**
  - `token: string | null`
  - `user: { id: string; email: string } | null`
  - `isHydrated: boolean`
  - Actions: `setToken`, `setUser`, `logout`, `markHydrated`
- **Persistence**
  - Storage key: `auth-store` (LocalStorage), JSON serialization.
  - Only `token` and `user` are persisted (`partialize`).
  - `onRehydrateStorage` marks the store as hydrated post-restore.

### 4) Form validations

- **Libraries**: `zod` + `react-hook-form` via `zodResolver`.
- **Strategy**
  - Synchronous schema validation ensures immediate field-level errors.
  - Submission is short-circuited on schema failure; server errors are surfaced as a form-level message.
- **Rules (current)**
  - Register
    - `fullName`: `min(2)`
    - `email`: `email()`
    - `phone`: `min(6)`, `max(20)`, `regex(/^[+0-9()\\-\\s]*$/)`
    - `password`: `min(12)` and matches `confirmPassword`
    - `confirmPassword`: `min(12)`
  - Login
    - `email`: `email()`
    - `password`: `min(6)`

### 5) Theme and design system

- **Tech stack**
  - Tailwind CSS with `@theme inline` tokens.
  - shadcn/ui base styles imported.
  - Optional animation utilities via `tw-animate-css`.
- **File**: `src/app/globals.css`
- **Theme tokens**
  - Color tokens defined using OKLCH for perceptual color consistency.
  - Key CSS variables: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, chart palette, and sidebar palette.
  - Radius scale: `--radius-sm` … `--radius-4xl`, derived from `--radius`.
  - Font tokens mapped to CSS variables (`--font-sans`, `--font-heading`, `--font-mono`).
- **Dark mode**
  - Class-based: `.dark` overrides all major tokens for backgrounds, text, borders, and charts.
  - Utility: `@custom-variant dark (&:is(.dark *));` for styling descendants in dark context.
- **Base layer**
  - Applies `bg-background` and `text-foreground` to `body`.
  - Ensures components pick up border and focus ring tokens.

### Networking and environment

- **HTTP wrapper**: `src/lib/api.ts`
  - `apiFetch` attaches `Authorization: Bearer <token>` when available (read from persisted auth store).
  - `credentials: "include"` to support cookie-based scenarios where relevant.
  - Non-2xx responses throw with response text or status code.
  - Helpers: `api.get/post/patch/put/delete` thin wrappers over `apiFetch`.
- **Base URL**
  - `NEXT_PUBLIC_API_BASE_URL` (public) is required; trailing slashes auto-trimmed.

### Security and UX considerations

- Tokens are stored in LocalStorage (simple and fast). If higher security is required, consider httpOnly cookies and rotating refresh tokens.
- Password field has a 12-char minimum on registration (configurable). Consider enforcing complexity rules server-side (and mirroring in the client for UX).
- Client-side validation improves UX; server must still validate all inputs.

### Quick links

- Register screen: `src/app/register/page.tsx`
- Login screen: `src/app/login/page.tsx`
- Auth store: `src/store/auth.ts`
- API wrapper: `src/lib/api.ts`
- Theme: `src/app/globals.css`

### Next steps (optional)

- Align login password minimum length with registration policy (12+) for consistency.
- Add eye icons for password toggle (e.g., lucide-react) for visual parity with reference design.
- Centralize form error presentation patterns as reusable components.
