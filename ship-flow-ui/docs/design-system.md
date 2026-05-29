# ShipFlow UI - Design System

## Overview

ShipFlow UI uses **Tailwind CSS v4** with a custom theme configuration. The design system is built around CSS custom properties (variables) using the OKLCH color format for perceptually uniform colors.

---

## Color Palette

### Primary Colors

| Token                  | Light Mode                   | Dark Mode                    | Usage                                 |
| ---------------------- | ---------------------------- | ---------------------------- | ------------------------------------- |
| `--primary`            | `oklch(0.488 0.243 264.376)` | `oklch(0.424 0.199 265.638)` | Primary buttons, links, active states |
| `--primary-foreground` | `oklch(0.97 0.014 254.604)`  | `oklch(0.97 0.014 254.604)`  | Text on primary backgrounds           |

### Secondary Colors

| Token                    | Light Mode                   | Dark Mode                    | Usage                         |
| ------------------------ | ---------------------------- | ---------------------------- | ----------------------------- |
| `--secondary`            | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary buttons, badges     |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`           | Text on secondary backgrounds |

### Background Colors

| Token                  | Light Mode                 | Dark Mode                  | Usage                        |
| ---------------------- | -------------------------- | -------------------------- | ---------------------------- |
| `--background`         | `oklch(1 0 0)` (white)     | `oklch(0.148 0.004 228.8)` | Page background              |
| `--foreground`         | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Primary text color           |
| `--card`               | `oklch(1 0 0)`             | `oklch(0.218 0.008 223.9)` | Card backgrounds             |
| `--card-foreground`    | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Text on cards                |
| `--popover`            | `oklch(1 0 0)`             | `oklch(0.218 0.008 223.9)` | Popover/dropdown backgrounds |
| `--popover-foreground` | `oklch(0.148 0.004 228.8)` | `oklch(0.987 0.002 197.1)` | Text in popovers             |

### Surface Colors (Material Design 3 Inspired)

| Token                        | Light Mode                   | Dark Mode                    | Usage                      |
| ---------------------------- | ---------------------------- | ---------------------------- | -------------------------- |
| `--surface`                  | `oklch(1 0 0)`               | `oklch(0.148 0.004 228.8)`   | Surface backgrounds        |
| `--on-surface`               | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | Content on surfaces        |
| `--surface-container`        | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Container backgrounds      |
| `--surface-container-low`    | `oklch(0.987 0.002 197.1)`   | `oklch(0.218 0.008 223.9)`   | Low emphasis containers    |
| `--surface-container-lowest` | `oklch(1 0 0)`               | `oklch(0.148 0.004 228.8)`   | Lowest emphasis containers |

### Muted & Accent Colors

| Token                 | Light Mode                 | Dark Mode                  | Usage                      |
| --------------------- | -------------------------- | -------------------------- | -------------------------- |
| `--muted`             | `oklch(0.963 0.002 197.1)` | `oklch(0.275 0.011 216.9)` | Muted backgrounds          |
| `--muted-foreground`  | `oklch(0.56 0.021 213.5)`  | `oklch(0.723 0.014 214.4)` | Secondary/muted text       |
| `--accent`            | `oklch(0.963 0.002 197.1)` | `oklch(0.275 0.011 216.9)` | Accent highlights          |
| `--accent-foreground` | `oklch(0.218 0.008 223.9)` | `oklch(0.987 0.002 197.1)` | Text on accent backgrounds |

### Utility Colors

| Token               | Light Mode                  | Dark Mode                   | Usage                             |
| ------------------- | --------------------------- | --------------------------- | --------------------------------- |
| `--destructive`     | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error states, destructive actions |
| `--border`          | `oklch(0.925 0.005 214.3)`  | `oklch(1 0 0 / 10%)`        | Borders                           |
| `--input`           | `oklch(0.925 0.005 214.3)`  | `oklch(1 0 0 / 15%)`        | Input field backgrounds           |
| `--ring`            | `oklch(0.723 0.014 214.4)`  | `oklch(0.56 0.021 213.5)`   | Focus rings                       |
| `--outline-variant` | `oklch(0.925 0.005 214.3)`  | `oklch(1 0 0 / 10%)`        | Outline variants                  |

### Chart Colors

| Token       | Value                        | Usage         |
| ----------- | ---------------------------- | ------------- |
| `--chart-1` | `oklch(0.809 0.105 251.813)` | Chart color 1 |
| `--chart-2` | `oklch(0.623 0.214 259.815)` | Chart color 2 |
| `--chart-3` | `oklch(0.546 0.245 262.881)` | Chart color 3 |
| `--chart-4` | `oklch(0.488 0.243 264.376)` | Chart color 4 |
| `--chart-5` | `oklch(0.424 0.199 265.638)` | Chart color 5 |

### Sidebar Colors

| Token                          | Light Mode                   | Dark Mode                    | Usage                   |
| ------------------------------ | ---------------------------- | ---------------------------- | ----------------------- |
| `--sidebar`                    | `oklch(0.987 0.002 197.1)`   | `oklch(0.218 0.008 223.9)`   | Sidebar background      |
| `--sidebar-foreground`         | `oklch(0.148 0.004 228.8)`   | `oklch(0.987 0.002 197.1)`   | Sidebar text            |
| `--sidebar-primary`            | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259.815)` | Primary sidebar accent  |
| `--sidebar-primary-foreground` | `oklch(0.97 0.014 254.604)`  | `oklch(0.97 0.014 254.604)`  | Text on primary sidebar |
| `--sidebar-accent`             | `oklch(0.963 0.002 197.1)`   | `oklch(0.275 0.011 216.9)`   | Sidebar accent          |
| `--sidebar-accent-foreground`  | `oklch(0.218 0.008 223.9)`   | `oklch(0.987 0.002 197.1)`   | Text on sidebar accent  |
| `--sidebar-border`             | `oklch(0.925 0.005 214.3)`   | `oklch(1 0 0 / 10%)`         | Sidebar borders         |
| `--sidebar-ring`               | `oklch(0.723 0.014 214.4)`   | `oklch(0.56 0.021 213.5)`    | Sidebar focus rings     |

---

## Typography

### Font Stack

| Token            | Value                                                                        | Usage                    |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------ |
| `--font-sans`    | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Primary font family      |
| `--font-mono`    | `var(--font-geist-mono)`                                                     | Monospace/code           |
| `--font-heading` | `var(--font-sans)`                                                           | Headings (inherits sans) |

### Base Styles

| Property    | Value            | Notes              |
| ----------- | ---------------- | ------------------ |
| Font Size   | `14px`           | Base rem reference |
| Line Height | `20px`           | 1.428 ratio        |
| Font Weight | `400` (normal)   | Body text          |
| Font Weight | `600`            | Headings (h1-h6)   |
| Font Color  | `rgb(12, 10, 9)` | Default text       |

---

## Border Radius

The radius system uses a base value of `0.625rem` (10px) with multipliers:

| Token          | Value                       | Size        |
| -------------- | --------------------------- | ----------- |
| `--radius-sm`  | `calc(var(--radius) * 0.6)` | 6px         |
| `--radius-md`  | `calc(var(--radius) * 0.8)` | 8px         |
| `--radius-lg`  | `var(--radius)`             | 10px (base) |
| `--radius-xl`  | `calc(var(--radius) * 1.4)` | 14px        |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` | 18px        |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` | 22px        |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` | 26px        |

---

## Usage

### CSS Custom Properties

Access theme values directly via CSS variables:

```css
.my-component {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-lg);
}
```

### Tailwind Classes

Theme values are mapped to Tailwind utilities:

```html
<!-- Colors -->
<div class="bg-primary text-primary-foreground">
  <div class="bg-secondary text-secondary-foreground">
    <div class="bg-muted text-muted-foreground">
      <div class="bg-card text-card-foreground">
        <!-- Border Radius -->
        <div class="rounded-sm">
          <!-- 6px -->
          <div class="rounded-md">
            <!-- 8px -->
            <div class="rounded-lg">
              <!-- 10px -->
              <div class="rounded-xl">
                <!-- 14px -->

                <!-- Dark mode -->
                <div class="dark bg-background text-foreground"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Color Format: OKLCH

Colors use the OKLCH format for better perceptual uniformity:

- **L** (Lightness): 0-1 scale
- **C** (Chroma): Color intensity
- **H** (Hue): 0-360 color wheel position

---

## Dark Mode

Dark mode is triggered via the `.dark` class on a parent element. All color tokens have dark variants that automatically apply.

```html
<html class="dark">
  <body>
    <!-- Dark mode colors automatically applied -->
  </body>
</html>
```

---

## File Reference

- **Source**: `src/app/globals.css`
- **Framework**: Tailwind CSS v4
- **UI Components**: shadcn/ui
