# HARVESTLINK 🌾
> Direct Market Access & Collective Order Assembly Platform for Marginal Farmers in Dakshina Kannada & Udupi, Karnataka, India.

---

## 🌟 Overview

**HARVESTLINK** is a full-stack agricultural marketplace platform built specifically to solve the structural challenges faced by marginal and smallholder farmers in coastal Karnataka (Dakshina Kannada and Udupi districts).

Traditional agricultural supply chains force smallholder farmers to sell through intermediaries and commission agents at local APMC mandis, taking steep price haircuts. Individual smallholders also struggle to meet the bulk volume requirements of institutional buyers, restaurants, and supermarket chains.

**HARVESTLINK solves this through two innovations:**
1. **Demand Radar**: A deterministic, rule-based matching engine that matches farmer produce with active buyer demand based on crop variety, quality grade, availability dates, and geographic proximity.
2. **Collective Order Assembly**: When no single marginal farmer can satisfy a buyer's bulk quantity requirement (e.g. 500 kg of Robusta bananas), HARVESTLINK automatically aggregates supply from multiple proximate farmers into a unified collective order proposal—preserving individual farmer pricing, quantity constraints, and consent.

---

## 🚀 Key Features

### 👨‍🌾 For Farmers
- **Listings Management**: Post produce with grade, asking price, minimum order quantity, and harvest availability windows.
- **Demand Radar**: Real-time matching against active buyer requirements with compatibility scoring and explanations.
- **Consent-First Collective Orders**: Receive order proposals where you review and independently approve or reject your specific volume contribution.
- **APMC Market Intelligence**: Reference benchmark prices from coastal mandis (Mangalore, Udupi, Puttur, Bantwal, Kundapura, Karkala).

### 🛒 For Buyers (Retailers, Caterers, Hotels, Processors)
- **Marketplace Discovery**: Filter active produce by category (fruits, vegetables, plantation crops, spices), district, and grade.
- **Bulk Requirement Posting**: Submit volume requirements with delivery windows, target prices, and locations.
- **Collective Supply Plan Generator**: Automatically calculate feasible multi-farmer supply plans with line-item breakdowns and logistics cost estimates.
- **Transparent Order Tracking**: Track multi-farmer acceptance status, packing, dispatch, transit, and delivery.

### 🛡️ For Administrators
- **Market Intelligence Control**: Update daily APMC modal and benchmark prices.
- **Platform Analytics**: Monitor active listings, collective orders, fulfillment rates, and gross merchandise volume.
- **Audit Logs & Dispute Resolution**: Full traceability on every order transition and proposal revision.

---

## 🛠️ Tech Stack

- **Frontend & App Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 with custom agricultural design system (forest green, earth amber, warm cream)
- **Icons**: Lucide React
- **Charts & Data Viz**: Recharts
- **State Management & Mock Backend**: In-memory persistent DataStore with seeded regional demo data and optional Supabase PostgreSQL schema
- **Validation**: Zod & React Hook Form
- **Testing**: Vitest & Testing Library (37 unit tests covering matching logic, unit conversion, inventory guards, and state transitions)

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Clone the repository and navigate into the workspace
git clone <repo-url>
cd Harvest_Link

# Install dependencies
npm install --legacy-peer-deps
```

### Running Locally
```bash
# Start the Vite development server
npm run dev

# Open your browser at http://localhost:5173/
```

### Running Tests
```bash
# Execute Vitest test suite
npx vitest run
```
All 37 test cases validate:
- Unit conversion (kg ↔ quintal ↔ tonne ↔ pieces)
- Grade compatibility hierarchy (Premium > Organic > Grade A > Grade B > Grade C)
- Availability date overlap checking
- Demand Radar hard filters and scoring
- Collective order assembly greedy solver
- Inventory non-negativity constraints
- Status state machines for proposals and orders

### Production Build
```bash
# Compile TypeScript and bundle with Vite
npm run build
```

---

## 👥 Demo Personas & Test Accounts

You can test any role directly from the **Sign In** page with quick one-click demo credentials:

| Persona | Name | Role | Location | Demo Email |
|---|---|---|---|---|
| **Farmer** | Suresh Kumar Shetty | Smallholder Farmer | Niddodi, Puttur | `demo.farmer1@harvestlink.demo` |
| **Farmer** | Laxmi Devadiga | Organic Farmer | Kalladka, Bantwal | `demo.farmer2@harvestlink.demo` |
| **Farmer** | Ramesh Poojary | Marginal Farmer | Moodbidri | `demo.farmer3@harvestlink.demo` |
| **Buyer** | Mangalore Fresh Mart | Retailer Chain | Mangalore City | `demo.buyer1@harvestlink.demo` |
| **Buyer** | Udupi Sri Krishna Bhavan | Restaurant / Hotel | Car Street, Udupi | `demo.buyer2@harvestlink.demo` |
| **Admin** | Admin Coordinator | Platform Manager | Mangalore APMC | `demo.admin@harvestlink.demo` |

*(Password for all demo accounts: `demo123`)*

---

## 📁 Project Structure

```
Harvest_Link/
├── index.html                   # HTML entry point with Inter font & SEO meta
├── vite.config.ts               # Vite configuration with Vitest setup
├── tsconfig.json                # TypeScript compiler configuration
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # App layout, router & code-split routes
│   ├── index.css                # Tailwind CSS v4 setup & theme tokens
│   ├── types/
│   │   └── index.ts             # TypeScript domain models & interfaces
│   ├── data/
│   │   └── demoData.ts          # Seeded Dakshina Kannada & Udupi crops & profiles
│   ├── context/
│   │   ├── AuthContext.tsx      # Demo authentication & active persona state
│   │   └── DataStore.tsx        # Centralized data store simulating database CRUD
│   ├── lib/
│   │   ├── matchingEngine.ts    # Demand Radar & Collective Order Assembly algorithms
│   │   ├── utils.ts             # Formatting, currency, classnames helpers
│   │   └── supabase.ts          # Supabase client connector
│   ├── components/
│   │   ├── layout/              # AppLayout, Navbar, Footer, MobileNav
│   │   └── ui/                  # Button, Card, Badge, Modal, Tabs, Select, Input
│   ├── pages/
│   │   ├── public/              # HomePage, MarketplacePage, PricesPage, HowItWorksPage
│   │   ├── auth/                # LoginPage, RegisterPage
│   │   ├── farmer/              # Dashboard, Listings, Demand Radar, Orders, Profile
│   │   ├── buyer/               # Dashboard, Requirements, Demand Matches, Orders
│   │   └── admin/               # Analytics, Mandi Prices, Users, Disputes
│   └── test/
│       ├── setup.ts             # Vitest test setup
│       └── matchingEngine.test.ts # Comprehensive test suite
```

---

## 📜 License
MIT License. Built for agricultural development and equitable farmer market access in Karnataka.
