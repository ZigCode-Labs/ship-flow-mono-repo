# Dashboard Module

## Overview

The Dashboard is the landing page after login. It gives a high-level snapshot of the business and provides quick-access shortcuts to common workflows.

**URL:** `/dashboard`  
**Navigation:** Top nav → "Dashboard"

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  [ExDocs Logo]  Dashboard | Domestic | Production | ...   │
│                              [Find Buyers]  [REACHER ▼]   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Welcome to Export Documentation Platform                 │
│  Streamline your export documentation with AI tools       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  🔒 Protect your account with 2FA    [Enable 2FA]   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  Total   │ │Documents │ │  Active  │ │  Total   │    │
│  │  Items   │ │          │ │  Orders  │ │ Payments │    │
│  │    1     │ │    4     │ │    1     │ │    $0    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                           │
│  Quick Actions                   Recent Activity          │
│  ┌─────────────────┐ ┌──────┐   ┌──────────────────────┐ │
│  │ AI Item Analysis│ │ Bulk │   │ • Created sample inv  │ │
│  │ Create CI       │ │ Imp. │   │ • Created CI: CI-001  │ │
│  │ Sample Invoice  │ │ Pack │   │ • Added new item GTS  │ │
│  │                 │ │ List │   │ • Added buyer: reacher│ │
│  └─────────────────┘ └──────┘   └──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## KPI Cards

| Card               | Description                                     |
| ------------------ | ----------------------------------------------- |
| **Total Items**    | Count of registered items in the export catalog |
| **Documents**      | Total export documents generated                |
| **Active Orders**  | Currently active export orders                  |
| **Total Payments** | Cumulative payment amount received              |

---

## Quick Actions

Six shortcut tiles for the most common workflows:

| Action                        | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| **AI Item Analysis**          | Upload product images to auto-extract item details using AI |
| **Bulk Import Items**         | Import multiple items from Excel or CSV                     |
| **Create Commercial Invoice** | Generate an export commercial invoice                       |
| **Create Packing List**       | Generate a packing list for shipment                        |
| **Sample Invoice**            | Quick-create a proforma invoice sample                      |
| **Payment History**           | View all payment transactions                               |

---

## Recent Activity Feed

Shows a real-time log of the last N actions performed in the organization:

- Document created (e.g., "Created commercial invoice: CI-001")
- Items added ("Added new item: GTS-0001")
- Buyers added ("Added new buyer: reacher")

A "View All Activity" button links to the full activity log (available under Reports → Activity Log).

---

## Security Banner

A dismissible prompt to enable **Two-Factor Authentication (2FA)** is shown to users who haven't enabled it. Takes approximately 2 minutes to set up.

---

## Design Notes

- Clean white background with light gray cards
- Stats use large bold numerals with relevant icons
- Quick Actions use a 2-column grid on desktop
- Recent Activity uses a narrow right panel on desktop
- Fully responsive — collapses to single column on mobile
