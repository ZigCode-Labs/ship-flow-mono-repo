# ShipFlow Design System

Tailwind CSS v4 design system for the ShipFlow web app. No `tailwind.config.js` — all configuration lives in CSS via `@theme inline`.

---

## How Tailwind v4 Is Configured

```css
/* apps/web/src/app/globals.css */
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Maps CSS custom properties → Tailwind utility names */
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... all tokens listed below */
}

:root {
  /* Actual OKLCH values for each token */
}
.dark {
  /* Dark mode overrides */
}
```

In v4, `@theme inline` is the replacement for `theme.extend` in `tailwind.config.js`. Tokens defined here become utility classes: `bg-primary`, `text-foreground`, `border-border`, etc.

Dark mode uses the `.dark` class strategy (`@custom-variant dark (&:is(.dark *))`), not media queries.

---

## Color Tokens

All colors use [OKLCH](https://oklch.com) — a perceptually uniform color space. Format: `oklch(L C H)` where L = lightness (0–1), C = chroma (saturation), H = hue angle.

### Light Mode (`:root`)

| Token                    | Value                        | Usage                                |
| ------------------------ | ---------------------------- | ------------------------------------ |
| `--background`           | `oklch(1 0 0)`               | Page background (pure white)         |
| `--foreground`           | `oklch(0.148 0.004 228.8)`   | Default text (near-black, cool tint) |
| `--primary`              | `oklch(0.488 0.243 264.376)` | Brand blue — primary actions         |
| `--primary-foreground`   | `oklch(0.97 0.014 254.604)`  | Text on primary (near-white)         |
| `--secondary`            | `oklch(0.967 0.001 286.375)` | Subtle gray background               |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)`  | Text on secondary                    |
| `--muted`                | `oklch(0.963 0.002 197.1)`   | Muted surface (light gray-blue)      |
| `--muted-foreground`     | `oklch(0.56 0.021 213.5)`    | Subdued text (medium gray)           |
| `--accent`               | `oklch(0.963 0.002 197.1)`   | Hover/accent surface (= muted)       |
| `--accent-foreground`    | `oklch(0.218 0.008 223.9)`   | Text on accent                       |
| `--destructive`          | `oklch(0.577 0.245 27.325)`  | Red — errors, delete actions         |
| `--border`               | `oklch(0.925 0.005 214.3)`   | Default border color                 |
| `--input`                | `oklch(0.925 0.005 214.3)`   | Input border color (= border)        |
| `--ring`                 | `oklch(0.723 0.014 214.4)`   | Focus ring color                     |
| `--card`                 | `oklch(1 0 0)`               | Card background (= background)       |
| `--card-foreground`      | `oklch(0.148 0.004 228.8)`   | Card text (= foreground)             |
| `--popover`              | `oklch(1 0 0)`               | Popover/dropdown background          |
| `--popover-foreground`   | `oklch(0.148 0.004 228.8)`   | Popover text                         |

### Sidebar Tokens (Light)

| Token                          | Value                                                 |
| ------------------------------ | ----------------------------------------------------- |
| `--sidebar`                    | `oklch(0.987 0.002 197.1)` — very light gray-blue     |
| `--sidebar-foreground`         | `oklch(0.148 0.004 228.8)`                            |
| `--sidebar-primary`            | `oklch(0.546 0.245 262.881)` — slightly brighter blue |
| `--sidebar-primary-foreground` | `oklch(0.97 0.014 254.604)`                           |
| `--sidebar-accent`             | `oklch(0.963 0.002 197.1)`                            |
| `--sidebar-accent-foreground`  | `oklch(0.218 0.008 223.9)`                            |
| `--sidebar-border`             | `oklch(0.925 0.005 214.3)`                            |
| `--sidebar-ring`               | `oklch(0.723 0.014 214.4)`                            |

### Chart Tokens (same in light + dark)

Blue monochromatic scale used for data visualizations:

| Token       | Value                        | Approximate       |
| ----------- | ---------------------------- | ----------------- |
| `--chart-1` | `oklch(0.809 0.105 251.813)` | Light blue        |
| `--chart-2` | `oklch(0.623 0.214 259.815)` | Medium-light blue |
| `--chart-3` | `oklch(0.546 0.245 262.881)` | Medium blue       |
| `--chart-4` | `oklch(0.488 0.243 264.376)` | Primary blue      |
| `--chart-5` | `oklch(0.424 0.199 265.638)` | Dark blue         |

### Surface Tokens (Material Design-inspired)

| Token                        | Value                                     |
| ---------------------------- | ----------------------------------------- |
| `--surface`                  | `oklch(1 0 0)` — = background             |
| `--on-surface`               | `oklch(0.148 0.004 228.8)` — = foreground |
| `--surface-container`        | `oklch(0.967 0.001 286.375)`              |
| `--surface-container-low`    | `oklch(0.987 0.002 197.1)`                |
| `--surface-container-lowest` | `oklch(1 0 0)`                            |
| `--outline-variant`          | `oklch(0.925 0.005 214.3)`                |

### Dark Mode (`.dark`)

| Token                | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| `--background`       | `oklch(0.148 0.004 228.8)` — dark navy                |
| `--foreground`       | `oklch(0.987 0.002 197.1)` — near-white               |
| `--card`             | `oklch(0.218 0.008 223.9)`                            |
| `--primary`          | `oklch(0.424 0.199 265.638)` — darker blue            |
| `--secondary`        | `oklch(0.274 0.006 286.033)`                          |
| `--muted`            | `oklch(0.275 0.011 216.9)`                            |
| `--muted-foreground` | `oklch(0.723 0.014 214.4)`                            |
| `--destructive`      | `oklch(0.704 0.191 22.216)` — lighter red for dark bg |
| `--border`           | `oklch(1 0 0 / 10%)` — white at 10% opacity           |
| `--input`            | `oklch(1 0 0 / 15%)`                                  |

---

## Radius Scale

Base radius: `--radius: 0.625rem` (10px).

All other radii are computed from the base:

| CSS Variable   | Formula                     | Value  |
| -------------- | --------------------------- | ------ |
| `--radius-sm`  | `calc(var(--radius) * 0.6)` | ≈ 6px  |
| `--radius-md`  | `calc(var(--radius) * 0.8)` | ≈ 8px  |
| `--radius-lg`  | `var(--radius)`             | 10px   |
| `--radius-xl`  | `calc(var(--radius) * 1.4)` | ≈ 14px |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` | ≈ 18px |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` | ≈ 22px |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` | ≈ 26px |

Tailwind utilities: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-4xl`.

> Note: Buttons use `rounded-[5px]` (hardcoded, not a token). Cards use `rounded-2xl`/`rounded-4xl`.

---

## Typography

```css
html {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 14px; /* base size — smaller than typical 16px */
  line-height: 20px;
  font-weight: 400;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 600;
}
```

Tailwind token: `--font-sans` → `font-sans` utility.

### Text Size Classes

| Class       | Size  | Notes                         |
| ----------- | ----- | ----------------------------- |
| `text-xs`   | 12px  | Badge labels, captions        |
| `text-sm`   | 14px  | Default body, inputs, buttons |
| `text-base` | 16px  | Card titles, section headings |
| `text-lg`+  | 18px+ | Page headings                 |

The base HTML font-size of 14px means `text-sm` = the body default.

---

## Components

All components live in `apps/web/src/components/ui/`. They use `class-variance-authority` (`cva`) for variant management and `cn()` (`clsx` + `tailwind-merge`) for class composition.

### Button

File: `src/components/ui/button.tsx`

Base classes (all buttons):

```
inline-flex shrink-0 items-center justify-center
rounded-[5px] border border-transparent
text-sm font-medium whitespace-nowrap
transition-all outline-none select-none
focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20
active:translate-y-px disabled:pointer-events-none disabled:opacity-50
aria-invalid:border-red-500 aria-invalid:ring-red-500/20
```

#### Variants

| Variant       | Classes                                                   | Use case           |
| ------------- | --------------------------------------------------------- | ------------------ |
| `default`     | `bg-blue-600 text-white hover:bg-blue-700`                | Primary action     |
| `outline`     | `border-gray-200 bg-white text-gray-700 hover:bg-gray-50` | Secondary action   |
| `secondary`   | `bg-gray-100 text-gray-700 hover:bg-gray-200`             | Tertiary action    |
| `ghost`       | `hover:bg-gray-100 hover:text-gray-900`                   | Minimal, nav items |
| `destructive` | `bg-red-50 text-red-600 hover:bg-red-100`                 | Delete, danger     |
| `link`        | `text-blue-600 underline-offset-4 hover:underline`        | Inline link-style  |

#### Sizes

| Size      | Height            | Padding           | Notes             |
| --------- | ----------------- | ----------------- | ----------------- |
| `default` | `h-10` (40px)     | `px-4`            | Standard CTA      |
| `sm`      | `h-9` (36px)      | `px-3`            | Compact action    |
| `xs`      | `h-7` (28px)      | `px-3`, `text-xs` | Tight spaces      |
| `lg`      | `h-11` (44px)     | `px-5`            | Hero/prominent    |
| `icon`    | `size-10` (40×40) | —                 | Icon-only, square |
| `icon-sm` | `size-9` (36×36)  | —                 |                   |
| `icon-xs` | `size-7` (28×28)  | —                 |                   |
| `icon-lg` | `size-11` (44×44) | —                 |                   |

```tsx
<Button variant="default" size="default">Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>
```

### Badge

File: `src/components/ui/badge.tsx`

Base classes: `inline-flex h-5 items-center rounded-3xl border border-transparent px-2 py-0.5 text-xs font-medium`

| Variant       | Classes                                           | Use case          |
| ------------- | ------------------------------------------------- | ----------------- |
| `default`     | `bg-primary text-primary-foreground`              | Active status     |
| `secondary`   | `bg-secondary text-secondary-foreground`          | Neutral label     |
| `destructive` | `bg-destructive/10 text-destructive`              | Error, deleted    |
| `outline`     | `border-border text-foreground`                   | Subtle tag        |
| `ghost`       | `hover:bg-muted hover:text-muted-foreground`      | Interactive label |
| `link`        | `text-primary underline-offset-4 hover:underline` | Clickable label   |

```tsx
<Badge variant="default">Active</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>
```

### Input

File: `src/components/ui/input.tsx`

```
h-10 w-full rounded-[5px]
border border-gray-200 bg-gray-50
px-4 py-2 text-sm text-gray-900
placeholder:text-gray-400
focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20
disabled:opacity-50
aria-invalid:border-red-500 aria-invalid:ring-red-500/20
```

Same height and border-radius as the default Button. The gray-50 background (`#f9fafb`) distinguishes inputs from page background.

### Card

File: `src/components/ui/card.tsx`

Sizes: `default` | `sm`

```
rounded-2xl bg-white border border-gray-100 shadow-sm
py-6 (sm: py-4)
flex flex-col gap-6 (sm: gap-4)
```

Sub-components:

- `CardHeader` — grid layout, supports title + optional `CardAction` in top-right
- `CardTitle` — `font-heading text-base font-medium`
- `CardDescription` — `text-sm text-muted-foreground`
- `CardContent` — `px-6` (sm: `px-4`)
- `CardFooter` — `flex items-center px-6`
- `CardAction` — positioned `col-start-2 row-span-2 self-start justify-self-end`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Invoice #INV0042</CardTitle>
    <CardDescription>Due in 15 days</CardDescription>
    <CardAction>
      <Button size="icon-sm" variant="ghost">
        <EllipsisIcon />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

---

## Focus & Validation States

These are consistent across all interactive components:

| State            | Classes                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| Focus ring       | `focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20` |
| Validation error | `aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/20`      |
| Disabled         | `disabled:pointer-events-none disabled:opacity-50`                                  |

Set `aria-invalid="true"` on an input to trigger the red error state — this is how react-hook-form surfaces field errors.

---

## Layout Patterns

### Page Background

```
bg-background text-foreground   (set on body)
```

### Sidebar

```
bg-sidebar text-sidebar-foreground
border-r border-sidebar-border
```

### Content Area

```
bg-surface-container-low   (very light, same as sidebar)
```

### Spacing Scale

Standard Tailwind spacing (4px base unit). Common values:

- `gap-1.5` (6px) — button icon gaps
- `gap-4` (16px) — card sm gap
- `gap-6` (24px) — card default gap
- `px-4` (16px) — button/input horizontal padding
- `px-6` (24px) — card content horizontal padding

---

## Dark Mode Strategy

Dark mode is activated by adding `.dark` class to the `<html>` element. All color tokens redefine under `.dark {}` in `globals.css`.

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

Use semantic tokens (`text-foreground`, `bg-background`, `border-border`) rather than hardcoded colors so components automatically adapt. The sidebar and chart tokens also have dark-mode overrides.

---

## `cn()` Utility

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn()` everywhere classes need to be conditionally merged or overridden. It resolves Tailwind conflicts (`twMerge`) and handles conditional classes (`clsx`).

```tsx
<div className={cn('base-classes', condition && 'conditional-class', className)} />
```

---

## Adding a New Component

1. Place in `src/components/ui/` if it's a primitive (no domain logic)
2. Place in `src/components/{feature}/` if it contains domain logic
3. Use `cva()` for components with multiple variants — never use ternaries for variant class selection
4. Use `cn()` for all class merging — never string concatenation
5. Accept a `className` prop and spread it through `cn()` so callers can extend
6. Add `data-slot="component-name"` for CSS targeting consistency with shadcn/ui patterns
7. Use semantic color tokens (`bg-primary`, `text-muted-foreground`) not raw OKLCH values

---

## Updating Tokens

To change the primary color sitewide:

```css
/* globals.css — :root block */
--primary: oklch(0.5 0.25 200); /* change hue to green */
--primary-foreground: oklch(0.97 0 0); /* adjust if needed */
```

No rebuild required — CSS custom properties cascade at runtime. The Tailwind token (`--color-primary: var(--primary)`) resolves at paint time.
