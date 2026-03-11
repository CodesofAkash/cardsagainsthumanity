# Cards Against Humanity – Frontend Internship Assignment

A pixel-perfect recreation of the [Cards Against Humanity](https://www.cardsagainsthumanity.com/) website built with a modern headless architecture. All content is fully dynamic and managed through Payload CMS, with commerce powered by Medusa.js.

---

## Live Links

| Service | URL |
|---|---|
| Frontend | *(Vercel URL here)* |
| Payload CMS Admin | *(Vercel CMS URL here)* |
| Medusa Backend | *(Render URL here)* |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| CMS | Payload CMS (Headless) |
| Commerce | Medusa.js |
| Frontend Deploy | Vercel |
| CMS Deploy | Vercel |
| Backend Deploy | Render (Free Tier) |

---

## Project Structure

```
cardsagainsthumanity/
├── frontend/         # Next.js App Router frontend
├── cms/              # Payload CMS instance
└── medusa/           # Medusa.js commerce backend
```

---

## Pages Recreated

- **Homepage** – `/` (mirrors https://www.cardsagainsthumanity.com/)
- **Product Page** – `/products/more-cah` (mirrors https://www.cardsagainsthumanity.com/products/more-cah)

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL or MongoDB instance
- Docker (optional, for local DB)

---

### 1. Payload CMS (`/cms`)

```bash
cd cms
cp .env.example .env   # fill in MONGODB_URL / DATABASE_URL, PAYLOAD_SECRET
pnpm install
pnpm dev               # http://localhost:3000
```

**Environment variables:**
```
DATABASE_URI=mongodb://...   # or postgres://...
PAYLOAD_SECRET=your-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

The admin panel is at `/admin`. Create your first admin user on first run.

---

### 2. Medusa Backend (`/medusa`)

```bash
cd medusa
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, COOKIE_SECRET
npm install
npm run dev            # http://localhost:9000
```

**Environment variables:**
```
DATABASE_URL=postgres://...
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

Seed the database:
```bash
npm run seed
```

---

### 3. Frontend (`/frontend`)

```bash
cd frontend
cp .env.local.example .env.local   # fill in CMS and Medusa URLs
npm install
npm run dev                        # http://localhost:3001
```

**Environment variables:**
```
NEXT_PUBLIC_CMS_URL=http://localhost:3000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your-publishable-key
```

---

## CMS Structure (Payload CMS)

### Collections
| Collection | Purpose |
|---|---|
| `Pages` | Homepage and other page content (hero, sections, buttons, text blocks) |
| `Products` | Product content – title, description, images, pricing, synced to Medusa |
| `Media` | All images and media assets |
| `Users` | CMS admin users |

### Globals
| Global | Purpose |
|---|---|
| `HomePage` | Homepage-specific global content |
| `SiteSettings` | Site-wide settings: footer, nav, metadata |

All frontend content is fetched at build time (or via ISR) from the Payload REST API. Changing any field in the CMS admin panel automatically reflects on the frontend via revalidation.

---

## Medusa Integration

The frontend uses the **Medusa JS Client** (`@medusajs/medusa-js`) to handle all commerce operations:

| Feature | Description |
|---|---|
| Product display | Products fetched from CMS; pricing/inventory from Medusa |
| Add to cart | Medusa cart API via `useCart` hook |
| Cart drawer | Slide-in cart powered by Medusa cart session |
| Login / Register | Medusa customer auth endpoints |
| Checkout | Medusa checkout flow with address + payment |
| Order creation | Orders created through Medusa |
| Dummy payment | Medusa test payment provider |

Key files:
- `frontend/hooks/useCart.ts` – cart state management
- `frontend/components/CartDrawer.tsx` – cart UI
- `frontend/components/CheckoutDrawer.tsx` – checkout flow
- `frontend/app/api/medusa-webhook/route.ts` – webhook handler

---

## CMS ↔ Medusa Sync

Two-way synchronization between Payload CMS and Medusa.js is implemented via webhooks:

### CMS → Medusa (Products)
A Payload **afterChange hook** on the `Products` collection fires whenever a product is created or updated. It calls the Medusa Admin API to create/update the corresponding product in Medusa, keeping title, description, images, and pricing in sync.

### Medusa → CMS (Webhook)
Medusa emits events (e.g. `product.updated`) which are consumed by the Next.js webhook endpoint at `/api/medusa-webhook`. This endpoint calls the Payload REST API to update the corresponding product document in the CMS.

```
Payload CMS
  └── afterChange hook → POST /admin/products (Medusa)

Medusa
  └── product.updated event → POST /api/medusa-webhook (Frontend/CMS listener)
                                └── PATCH /api/products/:id (Payload)
```

---

## Performance

Target: **95+ Lighthouse score**

- All images use `next/image` with proper `width`/`height` and `priority` on above-the-fold images
- Fonts loaded via `next/font`
- Static generation (SSG/ISR) for all pages
- Proper `<meta>` SEO tags on every page
- No render-blocking resources

---

## Deployment

### Frontend (Vercel)
```
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
```

### Payload CMS (Vercel)
```
Root Directory: cms
Build Command: npm run build
Output Directory: .next
```

### Medusa (Render)
```
Root Directory: medusa
Build Command: npm install && npm run build
Start Command: npm run start
```

---

## Assignment Context

Built for: **Weframetech Solutions Pvt Ltd** – Frontend Internship Round 2 Technical Assignment  
Deadline: March 12, 2026 – 10:00 PM IST
