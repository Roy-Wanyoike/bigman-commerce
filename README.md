# Bigman Commerce

Nairobi-based computer retailer e-commerce platform built with modern web technologies.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand
- **Authentication**: NextAuth v4 (Credentials Provider)
- **Payment**: M-Pesa (Lipa na M-Pesa STK Push — integration pending)

## Features

### Storefront
- Product catalog with 125+ products across 10 categories
- Product search with filtering
- Category-based browsing with mega menu navigation
- Product comparison (up to 4 products)
- Wishlist functionality
- Gaming, Refurbished, and Deals sections
- Brand pages
- Mobile-responsive design with bottom navigation

### Shopping Experience
- Shopping cart with quantity management
- Multi-step checkout (Contact → Delivery → Payment → Confirmation)
- Nairobi pickup or Kenya-wide courier delivery
- M-Pesa payment integration (UI ready)
- Order creation and tracking via API

### Admin Panel
- Product management (CRUD, import, image management)
- Category management with attributes
- Market price observation tracking
- Product approval workflow

### B2B Commerce
- Bulk quote request form
- Role-based pricing (customer, corporate, wholesale)
- Business registration support (KRA PIN)

### Security
- Security headers (CSP, X-Frame-Options, etc.)
- Rate limiting on API routes
- Admin route protection via middleware
- Input sanitization

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- SQLite3

### Installation

```bash
git clone https://github.com/Roy-Wanyoike/bigman-commerce.git
cd bigman-commerce
npm install
# or: bun install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` — SQLite connection string (default: `file:./db/custom.db`)
- `NEXTAUTH_SECRET` — Random string for session encryption
- `NEXTAUTH_URL` — Base URL (default: `http://localhost:3000`)

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

Then seed the database (if seed scripts are available).

### Development

```bash
npm run dev
# or: bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   │   ├── admin/          # Admin APIs
│   │   ├── auth/           # Authentication APIs
│   │   ├── b2b/            # B2B quote API
│   │   ├── brands/         # Brands API
│   │   ├── categories/     # Categories API
│   │   ├── orders/         # Orders API
│   │   ├── products/       # Products API
│   │   ├── search/         # Search API
│   │   └── services/       # Services API
│   ├── b2b/                # B2B quote request page
│   ├── brand/[slug]/       # Brand pages
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Multi-step checkout
│   ├── compare/            # Product comparison
│   ├── gaming/             # Gaming section
│   ├── refurbished/        # Refurbished products
│   ├── deals/              # Deals section
│   ├── wishlist/           # Wishlist
│   ├── account/            # User account & orders
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── search/             # Search results
│   ├── services/           # Professional services
│   └── shop/               # Main shop page
├── components/
│   ├── bigman/             # Custom components (Header, Footer, ProductCard, etc.)
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, auth, DB, store, security
├── middleware.ts            # Security middleware
└── prisma/
    └── schema.prisma       # Database schema
```

## License

Private — All rights reserved.
