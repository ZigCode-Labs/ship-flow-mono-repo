# Ship Flow UI - Design System

## Overview

This design system is built on top of **Tailwind CSS v4** with **shadcn/ui** components. It uses **OKLCH color format** for perceptually uniform colors with automatic dark mode support.

---

## Table of Contents

- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Border Radius](#border-radius)
- [Components](#components)
- [Dark Mode](#dark-mode)
- [Usage Guidelines](#usage-guidelines)

---

## Color System

### Semantic Colors

All colors are defined using OKLCH format for better perceptual uniformity.

| Token                  | Light Mode                   | Dark Mode                         | Usage                        |
| ---------------------- | ---------------------------- | --------------------------------- | ---------------------------- |
| `background`           | `oklch(1 0 0)` (White)       | `oklch(0.148 0.004 228.8)` (Dark) | Page background              |
| `foreground`           | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`        | Primary text                 |
| `card`                 | `oklch(1 0 0)`               | `oklch(0.218 0.008 223.9)`        | Card backgrounds             |
| `card-foreground`      | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`        | Card text                    |
| `popover`              | `oklch(1 0 0)`               | `oklch(0.218 0.008 223.9)`        | Popover/dropdown backgrounds |
| `popover-foreground`   | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`        | Popover text                 |
| `primary`              | `oklch(0.488 0.243 264.376)` | `oklch(0.424 0.199 265.638)`      | Primary buttons, links       |
| `primary-foreground`   | `oklch(0.97 0.014 254.604)`  | `oklch(0.97 0.014 254.604)`       | Text on primary              |
| `secondary`            | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)`      | Secondary buttons            |
| `secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`                | Text on secondary            |
| `muted`                | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`        | Muted backgrounds            |
| `muted-foreground`     | `oklch(0.56 0.021 213.5)`    | `oklch(0.723 0.014 214.4)`        | Secondary text               |
| `accent`               | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`        | Accent backgrounds           |
| `accent-foreground`    | `oklch(0.218 0.008 223.9)`   | `oklch(0.987 0.002 197.1)`        | Text on accent               |
| `destructive`          | `oklch(0.577 0.245 27.325)`  | `oklch(0.704 0.191 22.216)`       | Error states, danger actions |
| `border`               | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 10%)`              | Borders                      |
| `input`                | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 15%)`              | Input backgrounds            |
| `ring`                 | `oklch(0.723 0.014 214.4)`   | `oklch(0.56 0.021 213.5)`         | Focus rings                  |

### Chart Colors

| Token     | Value                        | Usage              |
| --------- | ---------------------------- | ------------------ |
| `chart-1` | `oklch(0.809 0.105 251.813)` | Data visualization |
| `chart-2` | `oklch(0.623 0.214 259.815)` | Data visualization |
| `chart-3` | `oklch(0.546 0.245 262.881)` | Data visualization |
| `chart-4` | `oklch(0.488 0.243 264.376)` | Data visualization |
| `chart-5` | `oklch(0.424 0.199 265.638)` | Data visualization |

### Sidebar Colors

| Token                        | Light Mode                   | Dark Mode                    | Usage                |
| ---------------------------- | ---------------------------- | ---------------------------- | -------------------- |
| `sidebar`                    | `oklch(0.987 0.002 197.1)`   | `oklch(0.218 0.008 223.9)`   | Sidebar background   |
| `sidebar-foreground`         | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | Sidebar text         |
| `sidebar-primary`            | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` | Active/primary items |
| `sidebar-primary-foreground` | `oklch(0.97 0.014 254.604)`  | `oklch(0.97 0.014 254.604)`  | Text on primary      |
| `sidebar-accent`             | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | Hover/active accent  |
| `sidebar-accent-foreground`  | `oklch(0.218 0.008 223.9)`   | `oklch(0.987 0.002 197.1)`   | Text on accent       |
| `sidebar-border`             | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 10%)`         | Sidebar borders      |
| `sidebar-ring`               | `oklch(0.723 0.014 214.4)`   | `oklch(0.56 0.021 213.5)`    | Focus rings          |

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: var(--font-geist-mono);
--font-heading: var(--font-sans);
```

### Base Styles

| Property    | Value               |
| ----------- | ------------------- |
| Font Family | Inter, system fonts |
| Font Size   | 14px                |
| Line Height | 20px                |
| Font Weight | 400 (Normal)        |
| Base Color  | `rgb(12, 10, 9)`    |

### Heading Styles

| Element | Font Weight |
| ------- | ----------- |
| `h1`    | 600         |
| `h2`    | 600         |
| `h3`    | 600         |
| `h4`    | 600         |
| `h5`    | 600         |
| `h6`    | 600         |

---

## Spacing & Layout

The design system uses Tailwind's default spacing scale with the following patterns:

- **Page padding**: `p-8` (2rem / 32px)
- **Section gaps**: `space-y-10` (2.5rem / 40px)
- **Component gaps**: `gap-4` (1rem / 16px)
- **Inner spacing**: `p-4` (1rem / 16px)

### Layout Utilities

```
bg-gray-50          // Page background
min-h-screen        // Full viewport height
border rounded-xl   // Card styling
shadow-sm           // Subtle elevation
bg-white            // Card backgrounds
```

---

## Border Radius

Border radius is calculated from a base value using CSS custom properties.

| Token          | Formula               | Base Value (0.625rem) |
| -------------- | --------------------- | --------------------- |
| `--radius`     | Base                  | 0.625rem (10px)       |
| `--radius-sm`  | `var(--radius) * 0.6` | 0.375rem (6px)        |
| `--radius-md`  | `var(--radius) * 0.8` | 0.5rem (8px)          |
| `--radius-lg`  | `var(--radius)`       | 0.625rem (10px)       |
| `--radius-xl`  | `var(--radius) * 1.4` | 0.875rem (14px)       |
| `--radius-2xl` | `var(--radius) * 1.8` | 1.125rem (18px)       |
| `--radius-3xl` | `var(--radius) * 2.2` | 1.375rem (22px)       |
| `--radius-4xl` | `var(--radius) * 2.6` | 1.625rem (26px)       |

---

## Components

### Available UI Components

All components are located in `src/components/ui/` and follow shadcn/ui patterns.

#### Alert

- **Variants**: `default`, `destructive`
- **Usage**: System notifications, warnings, errors

#### Badge

- **Variants**: `default`, `secondary`, `destructive`, `outline`, `ghost`
- **Usage**: Labels, status indicators, tags

#### Button

- **Variants**: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`
- **Sizes**: `xs`, `sm`, `default`, `lg`, `icon`
- **Usage**: Primary actions, navigation, form submission

#### Card

- **Parts**: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Usage**: Content containers, information grouping

#### Input

- **Types**: `text`, `email`, `password`, `url`, `date`, `time`, `month`, `week`, `range`
- **Usage**: Form data entry

#### Form Components

- **Label**: Field labels
- **Dynamic Form**: JSON-driven form generation

#### Navigation

- **Breadcrumb**: Hierarchical navigation
- **Sidebar**: Collapsible navigation panel
- **Pagination**: Page navigation

#### Overlay

- **Dialog/Modal**: Modal windows
- **Dropdown Menu**: Context menus
- **Popover**: Floating content panels
- **Tooltip**: Contextual help text

#### Data Display

- **Table**: Data grids with header, body, footer
- **Accordion**: Collapsible content sections
- **Carousel**: Content sliders
- **Tabs**: Content organization
- **Progress**: Progress indicators

#### Feedback

- **Skeleton**: Loading placeholders
- **Spinner**: Loading indicators
- **Toast**: Non-blocking notifications

### Component Usage Example

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="primary" size="default">
      Action
    </Button>
  </CardContent>
</Card>;
```

---

## Dark Mode

Dark mode is automatically applied when the `.dark` class is present on a parent element (typically `html` or `body`).

### Implementation

```tsx
// Using next-themes or similar
<html className="dark">{/* Content renders with dark mode colors */}</html>
```

### Color Inversion Strategy

| Light                 | Dark                              |
| --------------------- | --------------------------------- |
| `background` (white)  | `background` (dark)               |
| `foreground` (dark)   | `foreground` (light)              |
| `card` (white)        | `card` (dark gray)                |
| `border` (light gray) | `border` (semi-transparent white) |

---

## Usage Guidelines

### Import Paths

Always use absolute imports with the `@/` prefix:

```tsx
// Correct
import { Button } from '@/components/ui/button';

// Avoid
import { Button } from '../../../components/ui/button';
```

### Responsive Design

Use Tailwind's responsive prefixes for breakpoints:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{/* Responsive grid */}</div>
```

### Color Usage

- Use `primary` for main actions and interactive elements
- Use `secondary` for less prominent actions
- Use `muted` for backgrounds of secondary content
- Use `destructive` sparingly for delete/remove actions
- Use `border` for all dividers and outlines

### Spacing Convention

- `gap-2` (0.5rem): Tight spacing between related items
- `gap-4` (1rem): Standard spacing
- `gap-6` (1.5rem): Section spacing
- `gap-8` (2rem): Major section breaks

### Icon Usage

Use `lucide-react` for all icons:

```tsx
import { Plus, Settings, User } from 'lucide-react';
```

---

## CSS Architecture

The design system is configured in `@/app/globals.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

@theme inline {
  /* CSS variable mappings */
}

:root {
  /* Light mode color values */
}

.dark {
  /* Dark mode color values */
}

@layer base {
  /* Base element styles */
}
```

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Design system configuration
│   ├── designSystem/
│   │   └── page.tsx          # Component showcase
│   └── ...
├── components/
│   ├── ui/                   # shadcn/ui primitive components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── shared/               # Shared application components
│   └── {feature}/            # Feature-specific components
├── lib/
│   └── utils.ts              # Utility functions (cn, etc.)
└── store/
    └── ...                   # Zustand stores
```

---

## Additional Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Tailwind CSS v4**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
