# Feature: Subscription Plans

## Title

Subscription Management — Plan Tiers, Module Access Control & Billing

## Description

ShipFlow offers 3 subscription tiers (Basic, Advanced, Professional) with different module access. Plans are billed monthly with optional annual discounts. Each plan unlocks specific modules and feature limits. A Subscription Guard enforces access control throughout the app. The billing system integrates with Razorpay (India) or Stripe for payments.

---

## User Flow

```
1. Select Plan (on trial expiry or upgrade prompt)
   Settings → Subscription → View Plans
   → Compare plan features in table
   → "Upgrade to Advanced" / "Choose Professional"
   → Billing: Monthly or Annual (annual = 2 months free)
   → Payment: Razorpay (UPI, cards, netbanking for India) or Stripe
   → On success: plan activated, modules unlocked

2. Current Plan View
   Settings → Subscription
   → Shows: Plan name, Price, Renewal date, Features enabled
   → "Change Plan" button
   → "Cancel Subscription" button

3. Module Access Control
   Any locked module shows: "Upgrade to [Plan] to access [Module]"
   → CTA button to upgrade
```

---

## Plan Definitions

```ts
const PLANS = {
  BASIC: {
    name: 'Basic',
    priceMonthly: 2099, // INR
    priceAnnual: 20990, // INR (2 months free)
    maxUsers: 2,
    modules: {
      exports: true,
      domestic: false,
      production: false,
      inventory: false,
      imports: false,
      reports: 'basic', // executive summary only
      aiFeatures: false,
    },
    documentLimit: 50, // documents per month
  },
  ADVANCED: {
    name: 'Advanced',
    priceMonthly: 4899,
    priceAnnual: 48990,
    maxUsers: 5,
    modules: {
      exports: true,
      domestic: true,
      production: true,
      inventory: true,
      imports: false,
      reports: 'advanced', // + sales analysis, aging
      aiFeatures: true,
    },
    documentLimit: 200,
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceMonthly: 9099,
    priceAnnual: 90990,
    maxUsers: -1, // unlimited
    modules: {
      exports: true,
      domestic: true,
      production: true,
      inventory: true,
      imports: true,
      reports: 'full', // + AI suggestions, vessel planner
      aiFeatures: true,
    },
    documentLimit: -1, // unlimited
  },
};
```

---

## Database Schema (Prisma)

```prisma
model Subscription {
  id              String      @id @default(uuid())
  organizationId  String      @unique
  plan            PlanTier    @default(TRIAL)
  status          SubStatus   @default(ACTIVE)
  billingCycle    BillingCycle @default(MONTHLY)
  priceINR        Decimal     @db.Decimal(10, 2)
  startDate       DateTime    @default(now())
  endDate         DateTime?   // null = perpetual (cancelled = endDate in past)
  trialEndsAt     DateTime?
  cancelledAt     DateTime?
  paymentProvider String?     // RAZORPAY, STRIPE
  providerSubId   String?     // Razorpay/Stripe subscription ID
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  invoices        SubscriptionInvoice[]

  @@map("subscriptions")
}

model SubscriptionInvoice {
  id              String    @id @default(uuid())
  subscriptionId  String
  invoiceNumber   String    @unique
  amountINR       Decimal   @db.Decimal(10, 2)
  status          String    @default("PENDING")  // PENDING, PAID, FAILED
  periodStart     DateTime
  periodEnd       DateTime
  paymentProvider String?
  providerPayId   String?   // Razorpay/Stripe payment ID
  paidAt          DateTime?
  fileUrl         String?   // Invoice PDF
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  subscription    Subscription @relation(fields: [subscriptionId], references: [id])

  @@map("subscription_invoices")
}

enum PlanTier {
  TRIAL
  BASIC
  ADVANCED
  PROFESSIONAL
}

enum SubStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}
```

---

## Module Access Matrix

| Module                                   | TRIAL        | BASIC | ADVANCED | PROFESSIONAL |
| ---------------------------------------- | ------------ | ----- | -------- | ------------ |
| Export Documents (PI, CI, PL, COO, etc.) | ✅ (limited) | ✅    | ✅       | ✅           |
| Export Buyers & Contacts                 | ✅           | ✅    | ✅       | ✅           |
| Items Catalog                            | ✅           | ✅    | ✅       | ✅           |
| Post-Shipment Docs                       | ❌           | ✅    | ✅       | ✅           |
| Payment Tracking                         | ❌           | ✅    | ✅       | ✅           |
| Domestic Module                          | ❌           | ❌    | ✅       | ✅           |
| Production Module                        | ❌           | ❌    | ✅       | ✅           |
| Inventory Module                         | ❌           | ❌    | ✅       | ✅           |
| Import Module                            | ❌           | ❌    | ❌       | ✅           |
| Reports (Basic)                          | ✅           | ✅    | ✅       | ✅           |
| Reports (Advanced + AI)                  | ❌           | ❌    | ✅       | ✅           |
| Vessel Cut-Off Planner                   | ❌           | ❌    | ❌       | ✅           |
| AI Features                              | ❌           | ❌    | ✅       | ✅           |
| Max Users                                | 1            | 2     | 5        | Unlimited    |
| Documents/Month                          | 10           | 50    | 200      | Unlimited    |

---

## API Routes (NestJS)

```
GET    /api/v1/subscription                    → Current subscription status
GET    /api/v1/subscription/plans              → All plan definitions (public)
POST   /api/v1/subscription/checkout           → Create Razorpay/Stripe checkout session
POST   /api/v1/subscription/webhook            → Payment provider webhook (verify + activate)
POST   /api/v1/subscription/cancel             → Cancel subscription
PATCH  /api/v1/subscription/plan               → Change plan

GET    /api/v1/subscription/invoices           → Billing history
GET    /api/v1/subscription/invoices/:id/download → Download invoice PDF
```

---

## Subscription Guard

```ts
// common/guards/subscription.guard.ts
// Usage: @RequiresModule('imports') on controller or specific route

@Injectable()
export class SubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.get<string>('requiredModule', context.getHandler());
    if (!requiredModule) return true;

    const request = context.switchToHttp().getRequest();
    const orgId = request.headers['x-org-id'];

    const subscription = await this.subService.getSubscription(orgId);
    const hasAccess = this.subService.checkModuleAccess(subscription.plan, requiredModule);

    if (!hasAccess) {
      throw new ForbiddenException({
        code: 'MODULE_LOCKED',
        message: `Upgrade your plan to access ${requiredModule}`,
        requiredPlan: this.subService.getRequiredPlan(requiredModule),
      });
    }
    return true;
  }
}

// Decorator
export const RequiresModule = (module: string) => SetMetadata('requiredModule', module);

// Usage on controllers
@Controller('imports')
@UseGuards(JwtAuthGuard, OrgContextGuard, SubscriptionGuard)
@RequiresModule('imports')
export class ImportsController { ... }
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/subscription.ts

export const checkoutSchema = z.object({
  plan: z.enum(['BASIC', 'ADVANCED', 'PROFESSIONAL']),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
  provider: z.enum(['RAZORPAY', 'STRIPE']).default('RAZORPAY'),
});

export const cancelSchema = z.object({
  reason: z.string().min(1, 'Reason required').max(500),
  feedback: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build the Subscription Management feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/subscription/:

1. SubscriptionModule with SubscriptionService, SubscriptionGuard

2. Subscription service:
   - getSubscription(orgId): returns current Subscription with plan tier
   - checkModuleAccess(plan, module): boolean check against PLAN_MODULES config object
   - getRequiredPlan(module): returns minimum plan needed
   - Auto-create TRIAL subscription on org creation (14-day trial)

3. Razorpay integration (primary for Indian customers):
   - POST /subscription/checkout:
     → Create Razorpay subscription (recurring) or order (one-time)
     → Return { orderId, keyId } to frontend
   - POST /subscription/webhook:
     → Verify Razorpay webhook signature (X-Razorpay-Signature header)
     → On payment.captured: update subscription to ACTIVE, set plan + endDate
     → On subscription.halted: update status to PAST_DUE

4. PLAN_MODULES config (in src/config/plans.ts):
   Map each module name to required plan tier for easy future updates

5. SubscriptionGuard:
   @RequiresModule('imports') decorator → checks plan against PLAN_MODULES
   On failure: throw ForbiddenException with { code: 'MODULE_LOCKED', requiredPlan }

6. Trial handling:
   - trialEndsAt set to now() + 14 days on org creation
   - GET /subscription returns: isTrial: true, trialDaysLeft: N
   - After trial: status = EXPIRED; block all module access except plan selection page

FRONTEND — apps/web/app/(dashboard)/settings/subscription/:

1. /page.tsx: Current plan overview
   - Plan name, price, renewal date, billing cycle
   - "Manage Plan" / "Upgrade" button
   - Billing history table (date, amount, status, download)
   - Trial countdown banner (if on trial): "X days left in your trial. Upgrade now."

2. /plans/page.tsx: Plan comparison page
   - 3 plan cards side by side: Basic | Advanced | Professional
   - Feature grid showing ✅/❌ per module per plan
   - Current plan highlighted
   - Billing toggle: Monthly / Annual (shows price for each)
   - "Select Plan" button → opens payment flow

3. Razorpay integration (frontend):
   - Load Razorpay script: <script src="https://checkout.razorpay.com/v1/checkout.js">
   - On plan selection: POST /subscription/checkout → get orderId
   - Open Razorpay modal with orderId
   - On success callback: show "Payment successful! Your plan is being activated..."
   - TanStack Query: invalidate ["subscription"] on success

4. Locked module UI:
   - `<ModuleLockedBanner>` component: shown when SubscriptionGuard returns MODULE_LOCKED
   - Shows: lock icon, module name, required plan, "Upgrade to [Plan]" button
   - Used in: Imports section, Production section sidebar items (grayed out with lock icon)

5. Sidebar treatment for locked modules:
   - Locked nav items: grayed text + lock icon 🔒
   - Clicking a locked item: redirect to /settings/subscription/plans

Stripe integration (optional/secondary):
   - POST /subscription/checkout?provider=stripe → Stripe Checkout Session URL
   - Redirect to Stripe Checkout → on success/cancel: redirect back with session_id param
   - POST /subscription/webhook with Stripe-Signature header

Use TanStack Query for subscription data. Stale time: 5 minutes.
```
