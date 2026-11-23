# WALLFLOWER — Art Prints & Posters

A complete, visually polished, premium e-commerce website for the poster and wall-art brand **WALLFLOWER**.

Built strictly in accordance with the **WALLFLOWER Development Specification Version 1.0**.

---

## 🎨 Design Philosophy & Visual Identity

- **Minimalist & Editorial:** Designed like an independent art and design gallery. The interface acts as a quiet canvas that complements the artwork.
- **White-Themed Color Palette:**
  - `Pure White (#FFFFFF)`: Primary website background
  - `Off White (#FAFAFA)`: Secondary backgrounds and subtle sections
  - `Light Gray (#F2F2F2)`: Secondary interface elements & subtle containers
  - `Medium Gray (#888888)`: Secondary text & subtle descriptors
  - `Dark Gray (#333333)`: Supporting text & descriptions
  - `Near Black (#171717)`: Primary headings, buttons, and important text
  - `Blue (#2677E8)`: Exclusively used for highlighting the selected poster size and active interactive states
- **Typography:** Modern, crisp sans-serif (*Plus Jakarta Sans*) with proportional line-heights and high legibility.

---

## ✨ Features & Specification Compliance

### 1. Navigation & Header
- **Brand Logo:** `wallflower.` in clean lowercase lettering on the left. Click redirects to home/catalog.
- **Catalog Navigation:** Directly navigates to the responsive product grid.
- **Collection Dropdown:** Clean white dropdown with subtle shadow and border. Displays two distinct, independently clickable options:
  1. *Option 1: Create Your Own Collection* (Studio wall art builder preview)
  2. *Option 2: Collections by Wallflower* (Curated trios and duo suites with bundle pricing)
  Closes smoothly on outside click or option selection.
- **Shopping Bag / Cart Icon:** Positioned separately with dynamic item counter badge. Opens the slide-over cart drawer.

### 2. Catalogue Grid
- **Responsive Layout:**
  - Desktop: 4 columns
  - Tablets: 2–3 columns
  - Mobile: 2 columns with aspect-ratio preservation
- **Product Cards:**
  - Aspect ratio preserved poster frame (standard 3:4 portrait ratio)
  - Product name and starting price underneath
  - Subtle hover lift effect (`transform: translateY(-4px)`)
  - Entire card is clickable to open the dedicated Product Detail Page

### 3. Dedicated Individual Product Detail Page
- **Mandatory Two-Column Desktop Layout:**
  - **LEFT COLUMN:** Large poster image presentation, centered with generous whitespace, crisp framing, and zero distortion.
  - **RIGHT COLUMN:** Product name, subtitle, curated description, dynamic price, size selection, quantity selector, and purchasing buttons.
- **Poster Size Selection (A3, A4, A5):**
  - All three options visible simultaneously as small rounded rectangular boxes.
  - **A4 is selected by default.**
  - Selected state: highlighted in **Blue (`#2677E8`)** with bold white text.
  - Unselected state: white background with subtle gray border.
  - Switching updates price instantly without page reload and preserves state for the cart.
- **Quantity Selector:**
  - Horizontal layout: `[-]` `[qty]` `[+]`
  - Default quantity: **1**.
  - Minimum allowed quantity: **1** (cannot become 0 or negative).
  - When quantity is **1**: Minus button is faded, light gray, and disabled.
  - When quantity is **> 1**: Minus button activates with near-black color.
- **Add to Cart Button:**
  - Full-width near-black button (`#171717`) with white text and rounded corners.
  - Captures Product ID, name, image, selected size, quantity, and unit price.
  - Merges duplicate items with the same size consistently.
  - Clear visual feedback: changes to **"Added to Cart ✓"** for 2 seconds.
- **Buy Now Button:**
  - White background, dark text, thin dark border, and subtle hover.
  - Connects directly to the express purchase-flow entry point with current product, size, and quantity.

### 4. Shopping Bag Drawer & Purchase Flow
- Slide-over drawer displaying line items, sizes, quantities, and subtotal.
- Express Purchase Flow Entry Point modal allowing end-to-end checkout simulation with simulated order confirmation.
- URL hash history synchronization (`#catalog`, `#product/:id`, `#collection/custom`, `#collection/curated`) supporting browser back/forward buttons and direct linking.

---

## 🚀 Running the Project

```bash
# 1. Navigate to the project directory
cd "C:\Users\dhruv\.gemini\antigravity\scratch\wallflower"

# 2. Run the development server
npm run dev

# 3. Or build for production
npm run build
npm run preview
```

The live preview is running at **http://localhost:4173/**.

---

## 📁 File Structure

```text
wallflower/
├── dist/                     # Optimized production build
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Brand logo, Catalog, Collection dropdown, Cart trigger
│   │   ├── CatalogGrid.tsx    # 4-col responsive poster grid with category filters
│   │   ├── ProductCard.tsx    # Aspect-ratio preserved card with hover transitions
│   │   ├── ProductDetail.tsx  # Side-by-side desktop layout, size & qty selectors
│   │   ├── CartDrawer.tsx     # Slide-over bag with quantity adjust & line-item totals
│   │   ├── CollectionsView.tsx# Custom gallery builder & curated suites
│   │   ├── CheckoutDrawer.tsx # Express purchase-flow entry point & confirmation
│   │   └── Footer.tsx         # Archival print specs & brand story
│   ├── data/
│   │   └── posters.ts         # 12 museum-grade poster products with independent A3/A4/A5 pricing
│   ├── styles/
│   │   └── index.css          # Specification palette tokens, typography & animations
│   ├── utils/
│   │   └── posterArt.ts       # Procedural SVG vector poster artwork generator
│   ├── types.ts               # TypeScript interfaces for Posters, Sizes, Cart & Navigation
│   ├── App.tsx                # Application root with hash routing & cart state
│   └── main.tsx               # React 18 DOM entry point
├── index.html                 # Modern typography & viewport setup
├── package.json               # Dependencies (React 18, Lucide React, Vite, TypeScript)
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build configuration
```
