# Feature: Authentication & Security

## Title

User Authentication — Register, Login, JWT Tokens, Refresh, 2FA

## Description

Full authentication system with email/password registration and login, JWT access+refresh token strategy, optional Google OAuth, and Two-Factor Authentication (2FA). Multi-organization support — a single user can belong to multiple orgs.

---

## User Flow

```
1. Register
   User fills name, email, password → Server hashes password (bcrypt)
   → Creates User + OWNER role + default org → Issues access + refresh tokens
   → Redirects to Onboarding wizard

2. Login
   User enters email + password → Passport-local validates
   → Issues access token (memory) + refresh token (httpOnly cookie)
   → Redirects to Dashboard

3. Token Refresh
   Access token expires → Client calls POST /auth/refresh
   → Server validates refresh token → Issues new pair → Old refresh invalidated

4. 2FA
   User enables 2FA → Server generates TOTP secret → User scans QR
   → On next login, prompted for 6-digit TOTP code → Verified before issuing tokens

5. Logout
   Client calls POST /auth/logout → Server invalidates refresh token in DB
   → Clears httpOnly cookie
```

---

## Database Schema (Prisma)

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String?
  name         String
  avatarUrl    String?
  totpSecret   String?   // encrypted TOTP secret for 2FA
  totpEnabled  Boolean   @default(false)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  roles         UserRole[]
  memberships   OrganizationMember[]
  refreshTokens RefreshToken[]

  @@map("users")
}

model UserRole {
  id     String   @id @default(uuid())
  userId String
  role   GlobalRole

  user   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, role])
  @@map("user_roles")
}

enum GlobalRole {
  OWNER
  STAFF
  SUPER_ADMIN
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String   // bcrypt hash of raw token
  deviceId  String?
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}
```

---

## API Routes (NestJS)

```
POST /api/v1/auth/register          → Create account + issue tokens
POST /api/v1/auth/login             → Email/password login + issue tokens
POST /api/v1/auth/google            → Google OAuth callback
POST /api/v1/auth/refresh           → Rotate refresh token
POST /api/v1/auth/logout            → Revoke refresh token
POST /api/v1/auth/forgot-password   → Send reset email
POST /api/v1/auth/reset-password    → Reset with token
POST /api/v1/auth/2fa/setup         → Generate TOTP secret + QR
POST /api/v1/auth/2fa/verify        → Verify TOTP code + enable
POST /api/v1/auth/2fa/disable       → Disable 2FA
```

---

## UI Screens / Components

| Screen               | Route                    | Components                                                       |
| -------------------- | ------------------------ | ---------------------------------------------------------------- |
| Login page           | `/login`                 | `<LoginForm>`, email+password, "Forgot password" link            |
| Register page        | `/register`              | `<RegisterForm>`, name+email+password+confirm                    |
| Forgot Password      | `/forgot-password`       | Email field + submit                                             |
| Reset Password       | `/reset-password?token=` | New password + confirm                                           |
| 2FA Setup modal      | Dashboard → Security     | QR code + manual key + verify input                              |
| 2FA prompt           | After login              | 6-digit TOTP input                                               |
| Dashboard 2FA banner | Dashboard                | "Protect with 2FA" dismissible banner with `[Enable 2FA]` button |

---

## Form Fields & Zod Validations

### Register

```ts
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(80),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
```

### Login

```ts
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
  totpCode: z.string().length(6).optional(), // shown only when 2FA enabled
});
```

### Reset Password

```ts
const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword);
```

---

## Token Strategy

| Token         | Storage                      | Expiry    | Notes                        |
| ------------- | ---------------------------- | --------- | ---------------------------- |
| Access Token  | JS memory (not localStorage) | 4–6 hours | Sent in Authorization header |
| Refresh Token | httpOnly cookie              | 15 days   | Rotated on each use          |

**JWT Payload:**

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "OWNER",
  "orgId": "org-uuid",
  "iat": 1711100000,
  "exp": 1711122000
}
```

---

## Security Measures

| Measure                | Detail                                                      |
| ---------------------- | ----------------------------------------------------------- |
| Password hashing       | bcrypt, 12 salt rounds                                      |
| Rate limiting          | 5 login attempts / 15 min per IP                            |
| Refresh token rotation | Each use issues a new pair; old is revoked                  |
| TOTP 2FA               | `otplib` library; 30s window; secret stored encrypted in DB |
| httpOnly cookies       | Refresh token inaccessible to JS                            |
| CORS                   | Restrict to frontend origin only                            |
| Helmet                 | HTTP security headers                                       |

---

## LLM Development Prompt

```
You are building the Authentication module for ExDocs, an export management SaaS built with NestJS (backend) and Next.js 16 (frontend) in a Turborepo monorepo.

BACKEND TASKS:
1. Create `apps/api/src/modules/auth/` NestJS module with:
   - `auth.controller.ts` — routes: register, login, refresh, logout, forgot-password, reset-password
   - `auth.service.ts` — business logic with Prisma
   - `strategies/jwt.strategy.ts` — Passport JWT strategy validating access tokens
   - `strategies/local.strategy.ts` — Passport local strategy for email/password
   - `guards/jwt-auth.guard.ts` — extends AuthGuard('jwt')
   - `guards/roles.guard.ts` — checks @Roles() decorator
   - `decorators/current-user.decorator.ts` — extracts user from request
   - DTOs: CreateUserDto, LoginDto, RefreshDto — validated with Zod pipe

2. Password: hash with bcrypt (12 rounds) on register; compare on login.
3. JWT: issue short-lived access token (6h) + long-lived refresh token (15d).
   - Refresh token: store bcrypt hash in `refresh_tokens` table.
   - On refresh: validate hash, issue new pair, revoke old token (rotation).
   - Refresh token delivered via httpOnly, SameSite=Strict cookie.
4. Rate limiting: @nestjs/throttler, 5 attempts per 15 min on POST /auth/login.
5. 2FA: use `otplib` for TOTP. On setup: generate secret, return QR URI. On login: if totpEnabled, require code field.
6. Forgot/reset password: generate signed JWT with 15-min expiry, email it via nodemailer/SMTP.

FRONTEND TASKS:
1. Create `apps/web/app/(auth)/login/page.tsx`, `/register/page.tsx`, `/forgot-password/page.tsx`.
2. Use React Hook Form + Zod (schemas from `packages/schemas/src/auth.ts`) for all forms.
3. Access token: store in Zustand store in memory (never localStorage).
4. Axios interceptor in `packages/api-client/src/client.ts`:
   - Attach access token to every request
   - On 401: silently call POST /auth/refresh (cookie auto-sent), retry once
   - If refresh fails: clear store, redirect to /login
5. After login: call GET /organizations to determine if user has org → redirect to /onboarding if none, else /dashboard.
6. 2FA banner on dashboard: show if user.totpEnabled === false. "Enable 2FA" opens a shadcn/ui Dialog with QR code.

SHARED:
- Zod schemas in `packages/schemas/src/auth.ts`: RegisterSchema, LoginSchema, ResetPasswordSchema
- Types in `packages/types/src/models.ts`: JwtPayload, UserProfile

Use TypeScript strict mode. No any. Return standard API response format: { success, data, error }.
```
