# Wallflower — Full-Stack Architecture (Frontend & Backend)

This project has been separated into two dedicated applications:
1. `backend/` — Node.js / Express REST API Server
2. `frontend/` — React + TypeScript + Vite Single Page Application (Storefront + Admin Panel)

---

## 📁 Project Structure

```
Wallflower-main/
├── backend/
│   ├── package.json               # Backend dependencies (express, cors)
│   ├── data/
│   │   └── store.json             # Persistent JSON database (auto-seeded)
│   └── src/
│       ├── server.js              # Express server entry point (port 5000)
│       ├── db.js                  # Persistent database manager & audit logger
│       └── routes/
│           ├── auth.routes.js     # Admin authentication & session verification
│           ├── orders.routes.js   # Order lifecycle (Pending ➔ Completed Qikink)
│           ├── products.routes.js # Poster CRUD, multiple images & archiving
│           ├── collections.routes.js # Curated collections management
│           ├── customers.routes.js   # Registered customer accounts & LTV
│           ├── discounts.routes.js   # Coupons and promotions
│           ├── reviews.routes.js     # Moderation and customer feedback
│           └── analytics.routes.js   # Revenue, profit, sizes & bestsellers
│
├── frontend/
│   ├── package.json               # Frontend dependencies (React 18, lucide-react)
│   ├── vite.config.ts             # Vite configuration with /api reverse proxy
│   ├── tsconfig.json              # TypeScript configuration
│   ├── index.html                 # HTML entry point
│   ├── public/                    # Static assets & icons
│   └── src/
│       ├── main.tsx               # App router (Storefront vs #admin)
│       ├── App.tsx                # Customer storefront root
│       ├── components/            # Customer-facing components
│       ├── data/                  # Customer data models
│       ├── styles/                # Storefront CSS
│       └── admin/                 # Wallflower Admin Panel
│           ├── AdminApp.tsx       # Admin panel shell & sub-router
│           ├── AdminLogin.tsx     # Admin sign-in screen
│           ├── admin.css          # Admin panel styling
│           ├── types/             # Admin data types
│           ├── data/              # Admin data access services
│           └── components/        # Admin UI modules (11 full sections)
│
└── package.json                   # Root runner scripts
```

---

## 🚀 How to Run the Applications

### Option A: Run Both Together from Root
```bash
npm run dev
```

### Option B: Run Separately
```bash
# Terminal 1: Backend Server (Port 5000)
cd backend
npm start
# or: npm run dev (with hot-reload)

# Terminal 2: Frontend App (Port 5173)
cd frontend
npm run dev
```

Frontend will be accessible at: `http://localhost:5173/`  
Admin Panel will be accessible at: `http://localhost:5173/#admin`  
Backend API will be accessible at: `http://localhost:5000/api/health`

---

## 🔑 Default Administrator Credentials
* **Username**: `admin`
* **Password**: `wallflower@admin123`
*(Can be changed in Admin Settings ➔ Security)*

---

## 📡 REST API Reference

| Route | Method | Description |
|---|---|---|
| `/api/health` | GET | Server health check |
| `/api/admin/login` | POST | Authenticate admin & generate session |
| `/api/admin/me` | GET | Retrieve authenticated admin profile |
| `/api/admin/change-password` | POST | Change administrator password |
| `/api/admin/logs` | GET | Retrieve admin activity audit logs |
| `/api/orders` | GET / POST | Query orders with filters / Place order |
| `/api/orders/pending` | GET | Orders awaiting administrator Qikink submission |
| `/api/orders/completed` | GET | Orders successfully confirmed & submitted to Qikink |
| `/api/orders/:id/confirm` | PATCH | Confirm order submission to Qikink |
| `/api/orders/:id/shipping` | PATCH | Update courier, tracking ID & delivery status |
| `/api/orders/:id/cancel` | PATCH | Cancel order with reason |
| `/api/products` | GET / POST | List products / Add new poster design |
| `/api/products/:id` | GET / PUT / DELETE | Poster design details / Update / Delete |
| `/api/products/:id/archive` | PATCH | Archive poster design |
| `/api/products/:id/duplicate` | POST | Duplicate poster design |
| `/api/collections` | GET / POST | List collections / Create collection |
| `/api/collections/:id` | PUT / DELETE | Update / Delete collection |
| `/api/collections/reorder` | PATCH | Reorder collection display priority |
| `/api/customers` | GET | List registered customers with total spent & orders |
| `/api/discounts` | GET / POST | Promo codes list / Create promo code |
| `/api/discounts/:id/toggle` | PATCH | Enable or disable promo code |
| `/api/reviews` | GET / POST | List reviews / Submit customer review |
| `/api/reviews/:id/status` | PATCH | Approve or hide review |
| `/api/analytics/dashboard` | GET | Live visitors, revenue, profit, today's sales |
| `/api/analytics/sales` | GET | Time-series sales & profit (day/week/month/year) |
| `/api/analytics/bestsellers` | GET | Top 10 bestselling posters |
| `/api/analytics/sizes` | GET | Poster size breakdown (A3, A4, A5) |
