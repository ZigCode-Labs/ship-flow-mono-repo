# Inventory Module

## Overview

The Inventory module manages **finished goods stock** for the export business — tracking stock levels, receiving goods into stock, issuing stock for orders, adjustments, and storage locations.

**Navigation:** Top nav → "Inventory"

---

## Tab Navigation

The Inventory module uses a horizontal tab bar (no sidebar):

| Tab                 | Description                                               |
| ------------------- | --------------------------------------------------------- |
| **Stock Dashboard** | Overview of total items, in-stock and out-of-stock counts |
| **Stock Register**  | Full list of items with current stock levels              |
| **Receipts**        | History of stock received                                 |
| **Receive Stock**   | Record new stock arrivals                                 |
| **Issue Stock**     | Record stock issued for orders                            |
| **Adjust Stock**    | Make manual stock corrections                             |
| **Opening Stock**   | Set initial stock quantities                              |
| **Locations**       | Manage storage locations/warehouses                       |

---

## Stock Dashboard

**KPI Cards:**
| Card | Description |
|------|-------------|
| **Total Items** | Number of distinct SKUs tracked |
| **In Stock** | Items with qty > 0 (shown in green) |
| **Out of Stock** | Items with qty = 0 (shown in red) |

**Stock List Table:**
| Column | Description |
|--------|-------------|
| Image | Item thumbnail |
| Item Code | e.g., GTS-0001 |
| Name | Item description |
| Category | e.g., Metal Handicrafts & Home Décor |
| Stock | Current quantity on hand |
| Unit | Unit of measure (PCS, KGS, etc.) |
| Status | In Stock / Out of Stock badge |

**Search:** By item code or name  
**Sort:** By Item Code (default), Name, Stock Level

---

## Receive Stock

Record goods arriving into inventory (from production or purchase).

**Receive Stock form:**

- Item (select from catalog)
- Quantity received
- Receipt date
- Source (Production / Purchase Order / Transfer)
- Location (destination storage location)
- Batch/Lot number (optional)
- Notes

---

## Issue Stock

Record goods being taken out of inventory (for packing/shipment).

**Issue Stock form:**

- Item
- Quantity issued
- Issue date
- Destination/Purpose (Export Order reference, Job Work, etc.)
- Location (source storage location)
- Notes

---

## Adjust Stock

Make manual corrections to stock quantities (for cycle counts, damage write-offs, etc.).

**Adjust Stock form:**

- Item
- Adjustment Type (Add / Subtract)
- Quantity
- Reason (Cycle Count, Damage, Theft, etc.)
- Date, Notes

---

## Opening Stock

Set initial stock balances when setting up the system for the first time.

---

## Locations

Manage named storage locations (warehouses, shelves, zones).

**Location form:**

- Location name (e.g., "Main Warehouse", "Zone A", "Shelf B3")
- Description
- Address (optional)

---

## Key Notes

- Inventory tracks **finished goods** (export items). Raw material inventory is managed separately in the **Production → Raw Materials** section.
- Items appear here after being added to the **Items Catalog** in the Export module.
- The Stock Dashboard is the primary view — shows a live grid of all items with current stock status at a glance.
- The system warns when stock is low (below reorder level set in the item record).

---

## Relationship to Other Modules

| Module                     | Relationship                                  |
| -------------------------- | --------------------------------------------- |
| Exports → Items Catalog    | Items in the catalog appear in Inventory      |
| Production → Item Register | Finished production items feed into inventory |
| Export Orders              | Issuing stock links to an export order        |
| Reports                    | Inventory levels feed into stock reports      |
