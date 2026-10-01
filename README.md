# TRISHNA DURBAR RESTAURANT & BAR (तृष्णा दरबार)
### Operations, POS, 3D Table Matrix & Financial Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7_Strict-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-green)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)

A fresh, state-of-the-art internal restaurant operations, point-of-sale (POS), live table billing, and financial management platform crafted specifically for **Trishna Durbar Restaurant & Bar** (`Tirshana Darbar Resturant`).

Developed with an advanced **Regal Durbar Gold & Royal Obsidian** color scheme, interactive **3D animated hovering table cards**, 9 dedicated tables across 4 distinct floors, a full digital menu catalog digitized from physical menu cards, categorized expense management, real-time analytics, thermal printing for KOT & guest receipts, and signature branding: **Developed by SUJANGC**.

---

## 1. Key Features

### 🪑 Floor & Table Matrix (9 Dedicated Tables Across 4 Zones)
- **Ground Floor**: `Table 7`, `Table 8`, `Table 9` (3 Tables)
- **Main Hall**: `Table 1`, `Table 2`, `Table 3` (3 Tables)
- **First Floor**: `Table 4` (VIP Lounge Table)
- **Rooftop Terrace**: `Table 5`, `Table 6` (2 Tables with open-air views)
- **Interactive 3D Hovering**: Real-time cursor-tracking perspective tilt (`rotateX`, `rotateY`), dynamic specular glare highlight, and status glowing beacons.
- **Double-Order Guard**: Atomic Prisma transactions ensure active orders and occupied tables remain consistent.

### 🍽️ Complete Digital Menu (Digitized from User Menu Cards)
- **Chicken Items (चिकन)**: Roast, Chilli, Boil, Sadeko, Sekuwa, Bhuja/Chiura (Half / Full).
- **Mutton Items (मटन)**: Gravy, Fry, Sekuwa, Katnesi, Bhutan, Masu Bhuja, Buff Sukuti, Sausage Boiled & Fried.
- **Veg Items (भेज)**: French Fries, Chilli Potato, Choila, Paneer Fry, Paneer Chilli, Bhatmas Sada, Peanut Sadeko, Peanut Badam Sada, Almond/Mix Badam Sadeko, Green Salad, Fruit Salad, Mix Salad.
- **Combo Platters (कम्बो)**: Veg Feast Combo, Chicken Feast Combo, Mutton Feast Combo, Royal Non-Veg Durbar Platter (Mini & Large).
- **Momo Specials (म:म:)**: Steam Momo, Fried Momo, C. Momo, Chilli Momo, Jhol Momo (Half / Full).
- **Rice Items (राइस)**: Veg Fried Rice, Egg Fried Rice, Chicken Fried Rice, Mix Fried Rice, Biryani (Half / Full).
- **Snacks & Breakfast (नास्ता)**: Samosa, Samosa Chhole, Boiled Egg, Fried Egg, Puri Tarkari (2 pcs), Pakoda (per pc), Chicken/Veg/Egg Sandwiches, Egg Masala Omelette, Veg/Egg/Chicken/Mix Chowmein.
- **Beverages & Hot Drinks (Soft पेय)**: Black Tea, Lemon Tea, Milk Tea, Black Coffee, Milk Coffee, Sweet Lassi, Special Lassi, Mitha Dahi, Mahi, Frooti, Mineral Water, Coke / Fanta / Sprite.

### 🧾 Unified Live Table Billing & Settlement
- Real-time running bill computation with portion pricing and itemized additions.
- Dish notes (e.g. *"कम पिरो / less spicy"*, *"extra chutney"*).
- Discount application with instant recalculation.
- **Split & Partial Payments**: Cash (with cash tendered & change return calculator), Fonepay QR (with 1-click modal display), POS Card, Bank Transfer.
- **Atomic Checkout Enforcement**: Zero unpaid balance required before table is released back to Available.
- **Thermal Printing**: Formatted printouts for Kitchen Order Tickets (KOT) and official Guest Tax Invoices.

### 💸 Hotel & Restaurant Expense Outflows
- Categorized overhead tracking: Meat Purchases (Chicken & Mutton butcher bills), Kitchen Groceries & Vegetables, LPG Gas Refills, NEA Electricity Bill, Water Supply Tanker, Staff Salaries, Wi-Fi, Maintenance, and Rent.
- Filter by category and date range with live sum totals.

### 📊 Real-Time Financial Analytics & Dashboard
- Today / Weekly / Monthly / All-Time view.
- Total Revenue, Total Expenses, and Net Operational Profit ($\text{Sales} - \text{Expenses}$).
- Recharts visualizations: Financial balance comparisons, sales by floor zone (Ground, Hall, 1st Floor, Rooftop), and top best-selling menu items.

---

## 2. Dual Role Access & Pre-configured Credentials

Both Owner and Manager have **100% equal operational and administrative powers**:

| Role | Email Address | Password | Privileges |
|---|---|---|---|
| **Owner** | `owner@trishnadurbar.com` | `DurbarOwner@2026` | 100% Full Access: Tables, Orders, Billing, Menu, Expenses, Analytics, QR, Audit |
| **Manager** | `manager@trishnadurbar.com` | `DurbarManager@2026` | 100% Full Access: Tables, Orders, Billing, Menu, Expenses, Analytics, QR, Audit |

*The login page includes 1-click Quick-Fill buttons for both accounts.*

---

## 3. Technology Stack

* **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers)
* **Language:** TypeScript 5.7 (Strict Mode)
* **Styling & 3D:** Tailwind CSS, CSS 3D Perspective Transforms (`rotateX`, `rotateY`, `translateZ`, specular glass reflection)
* **Database & ORM:** Prisma 6 ORM with SQLite (`file:./dev.db`) + PostgreSQL switchable
* **Theme:** Regal Durbar Gold & Royal Obsidian with `next-themes` (Dark / Light)
* **Visualizations:** Recharts
* **Notifications:** Sonner Toast Provider
* **Timezone:** Nepal Standard Time (`Asia/Kathmandu`, UTC+5:45)
* **Signature Footer:** **Developed by SUJANGC**

---

## 4. Quick Start & Running Locally

```bash
# 1. Install dependencies (if fresh clone)
npm run db:sqlite

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```
