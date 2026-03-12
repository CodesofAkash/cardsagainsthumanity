# Cards Against Humanity — Clone

> Pixel-perfect clone of [cardsagainsthumanity.com](https://www.cardsagainsthumanity.com) built as a Weframetech Solutions internship assignment.

---

## Live Links

| Service | URL |
|---|---|
| **Frontend** | `https://cardsagainsthumanity-frontend.vercel.app` |
| **Payload CMS Admin** | `https://cardsagainsthumanity-cms.vercel.app/admin` |
| **Medusa Backend** | `https://cardsagainsthumanity-nkt4.onrender.com` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| CMS | Payload CMS 3 (MongoDB Atlas) |
| Commerce | Medusa.js v2 (PostgreSQL) |
| Animations | GSAP (lazy-loaded) |
| Deployment | Vercel (Frontend + CMS), Render (Medusa) |

---

## Project Structure

```
/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Homepage (Server Component)
│   │   ├── products/
│   │   │   └── more-cah/
│   │   │       └── page.tsx   # Product page
│   │   ├── auth/page.tsx      # Login/Register
│   │   └── api/
│   │       └── medusa-webhook/route.ts  # Medusa → CMS sync
│   ├── components/
│   │   ├── CartProvider.tsx   # Shared cart context
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx    # GSAP card animation (lazy loaded)
│   │   ├── BuySection.tsx
│   │   ├── EmailSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutDrawer.tsx
│   ├── hooks/
│   │   └── useCart.ts         # Cart state + Medusa API calls
│   └── next.config.ts
│
├── cms/                       # Payload CMS
│   └── src/
│       ├── collections/
│       │   ├── Users.ts
│       │   ├── Media.ts
│       │   ├── Products.ts    # Product catalog
│       │   ├── Pages.ts
│       │   ├── FAQs.ts        # FAQ accordion items
│       │   ├── StuffPosts.ts  # "Stuff we've done" cards
│       │   ├── BuyCards.ts    # "Buy the game" scroll cards
│       │   └── EmailPhrases.ts # Rotating email section phrases
│       ├── globals/
│       │   ├── HomePage.ts    # All homepage text content
│       │   └── SiteSettings.ts
│       └── payload.config.ts
│
└── medusa/                    # Medusa backend
    ├── medusa-config.ts
    └── .env
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (for Medusa)
- MongoDB Atlas account (for Payload CMS)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/cah-clone.git
cd cah-clone
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in .env.local (see below)
npm run dev       # http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_CMS_URL=http://localhost:3001
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_YOUR_KEY_HERE
NEXT_PUBLIC_MEDUSA_VARIANT_ID=variant_YOUR_VARIANT_ID
NEXT_PUBLIC_MEDUSA_REGION_ID=reg_YOUR_REGION_ID
```

### 3. Payload CMS

```bash
cd cms
npm install
cp .env.example .env
# Fill in .env (see below)
npm run dev       # http://localhost:3001
```

**`cms/.env`**
```env
PAYLOAD_SECRET=your_random_secret_string
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/cah-cms
MEDUSA_URL=http://localhost:9000
MEDUSA_ADMIN_TOKEN=your_medusa_admin_api_key
```

### 4. Medusa Backend

```bash
cd medusa
npm install
cp .env.example .env
# Fill in .env (see below)
npx medusa db:create
npx medusa db:migrate
npx medusa seed                    # optional: seed demo data
npm run dev       # http://localhost:9000
```

**`medusa/.env`**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa_db
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000,http://localhost:3000
AUTH_CORS=http://localhost:3000,http://localhost:9000
```

---

## CMS Structure

### Global: `home-page`

Controls all homepage text. Edit at `/admin/globals/home-page`.

| Field | Description |
|---|---|
| `hero.quotes` | Rotating press quotes (NPR, Bloomberg, etc.) |
| `about.paragraph1/2` | About section text |
| `buySection.heading` | "Buy the game." heading |
| `stealSection.*` | Steal section — heading, body, download URL, badge text |
| `stuffSection.*` | Stuff section — heading, badge text |
| `emailSection.*` | Email section — prefix, suffix, disclaimer |
| `faqSection.heading` | FAQ section heading |
| `footer.*` | Copyright + all link columns |

### Collections

| Collection | Purpose | How to add more |
|---|---|---|
| **Products** | Product catalog (synced with Medusa) | Create New → fill title, slug, description, price, images |
| **FAQs** | Homepage FAQ accordion | Create New → question + richText answer + order number |
| **BuyCards** | "Buy the game" horizontal scroll | Create New → label, CTA, href, background color, product image |
| **StuffPosts** | "Stuff we've done" cards | Create New → label, tag, description, image |
| **EmailPhrases** | Rotating phrases in email section | Create New → phrase text + order number |
| **Media** | All uploaded images | Auto-managed via upload fields |

**All collections have:**
- `order` field — lower number = appears first
- `published` checkbox — uncheck to hide without deleting

---

## Medusa Integration

### Product Flow

```
Medusa Admin → Create Product → Set Variant price + stock
                ↓ webhook
Payload CMS ← POST /api/medusa-webhook (syncs title, price, variantId)
                ↓
Frontend → fetches from CMS /api/products → displays on product page
```

### Cart Flow

```
User clicks "Add to Cart"
  → frontend calls POST /store/carts (create cart if none)
  → POST /store/carts/:id/line-items (add item)
  → Cart stored in localStorage

User clicks "Checkout"
  → POST /store/payment-collections { cart_id }
  → POST /store/payment-collections/:id/payment-sessions { provider_id: "pp_system_default" }
  → POST /store/carts/:id/complete
  → Returns { type: "order", order: { display_id, status } }
```

### Medusa API Keys

1. Go to `http://localhost:9000/app`
2. Settings → API Keys → Create Publishable Key
3. Copy to `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in frontend `.env.local`
4. Settings → API Keys → Create Secret Key  
5. Copy to `MEDUSA_ADMIN_TOKEN` in cms `.env`

---

## CMS ↔ Medusa Sync Mechanism

### Medusa → CMS (via Webhook)

When a product is created/updated in Medusa admin, it fires a webhook to the frontend's `/api/medusa-webhook` route, which then calls the Payload CMS API to create or update the corresponding product document.

**Register the webhook in Medusa:**
1. Go to Medusa Admin → Settings → Webhooks
2. Create webhook: `https://your-frontend.vercel.app/api/medusa-webhook`
3. Events: `product.created`, `product.updated`

**`app/api/medusa-webhook/route.ts`** receives the event and:
- Checks if a CMS product with matching `medusaId` exists
- If yes → updates it (title, price, variantId)
- If no → creates a new CMS product

### CMS → Medusa (Manual)

When you update a product price or details in Payload CMS, the `afterChange` hook in `Products.ts` calls the Medusa admin API to keep inventory in sync.

---

## Performance Optimizations (Lighthouse 95+)

| Technique | Implementation |
|---|---|
| **Server Components** | `page.tsx` is a server component — CMS data fetched server-side, zero client JS for static sections |
| **Lazy GSAP** | `import("gsap")` only runs after page load — not in initial JS bundle |
| **next/dynamic** | Hero, Navbar, BuySection, EmailSection, FAQSection all lazy-loaded |
| **next/image** | All `<img>` tags replaced with `<Image>` — automatic WebP/AVIF, lazy loading, size hints |
| **ISR** | CMS fetch uses `next: { revalidate: 60 }` — pages served from cache, rebuilt every 60s |
| **Font preloading** | `Inter` via `next/font/google` with `display: "swap"` |
| **compress: true** | `next.config.ts` enables gzip/brotli for all responses |
| **Static sections** | AboutSection, StealSection, StuffSection, FooterSection are pure server components |

---

## Deployment

### Frontend + CMS → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend && vercel --prod

# Deploy CMS
cd cms && vercel --prod
```

Set all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

### Medusa → Render

1. Push `medusa/` to a GitHub repo
2. Create a new **Web Service** on Render
3. Build command: `npm install && npx medusa db:migrate`
4. Start command: `npm start`
5. Add all env variables from `medusa/.env`
6. Add a **PostgreSQL** database on Render and copy the connection string to `DATABASE_URL`

---

## Scripts

```bash
# Frontend
npm run dev         # development server
npm run build       # production build
npm run start       # production server
ANALYZE=true npm run build  # bundle analysis

# CMS
npm run dev         # development server
npm run build       # production build

# Medusa
npm run dev         # development server
npx medusa db:migrate   # run migrations
```

---

## Credits

Built as an internship assignment for **Weframetech Solutions**.  
Original game by [Cards Against Humanity LLC](https://www.cardsagainsthumanity.com).