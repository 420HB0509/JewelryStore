# Maison Éclat — Jewelry Storefront with WhatsApp Checkout

A mobile-first jewelry storefront built with **React + Vite** and hosted on **Vercel**.
Customers browse, add pieces to a bag, and send a pre-filled order to you on **WhatsApp**.
You manage products, collections and delivery from the **Control Center** at `/admin`.

- No customer accounts and no online payment: orders are confirmed by hand on WhatsApp
- The bag lives in the customer's browser (`localStorage`), so it survives a refresh
- The catalog is stored in Upstash Redis and photos in Vercel Blob (both free tiers)

---

## 1. Control Center (`/admin`)

### One-time setup on Vercel

1. **Admin password:** in your Vercel project, go to **Settings → Environment Variables** and add
   `ADMIN_PASSWORD` with a strong password (at least 8 characters).
2. **Database for the catalog:** go to **Storage → Create Database → Upstash for Redis** (free plan) and connect it to the project.
   Keep the default environment variable prefix.
3. **Photo storage:** go to **Storage → Create → Blob** and connect it to the project.
4. **Redeploy:** open **Deployments**, choose the latest deployment, and click **Redeploy** so the new settings take effect.
5. Open `https://your-site.vercel.app/admin/`, log in, and click **Publish now**.

Until step 5, the store keeps showing the built-in sample catalog, so nothing breaks while you set things up.
If a step is missing, the control center tells you which one.

### What you can do

| Tab | Actions |
| --- | --- |
| **Products** | Add, edit, duplicate or delete products. Upload photos from your phone (they're resized automatically). Change name, description, material, price and "before discount" price. Add sizes and colors, and a *New* or *Best seller* label. Use the **Visible** switch to show or hide a product, and the stock menu to mark it *In stock*, *Few left* or *Out of stock*. Set a **delivery fee per product** (store default, free, or its own fee). |
| **Collections** | Create, rename, reorder, turn on or off, and delete collections, and set a cover photo. Each collection shows whether it's on the store and why. |
| **Delivery & settings** | WhatsApp number (with a test link), standard delivery fee (fixed or "confirm on WhatsApp"), free-delivery threshold, how per-product fees combine, announcement bar messages, Instagram, and **backup download/restore**. |

Changes go live on the store within about 10 seconds.

### How the store decides what to show

- A **product** appears when **Visible** is on and it has at least one photo.
  *Out of stock* products stay visible but can't be ordered.
- A **collection** appears only when it is **turned on** and contains **at least one visible, in-stock product**.
  Empty or fully sold-out collections hide automatically and come back when a product becomes available.
  *Best Sellers* is automatic: it lists every product labelled *Best seller*.
- **Delivery:** each product uses the store's standard fee unless you give it its own fee or free delivery.
  When the bag has products with different fees, choose in Settings between:
  - **Charge once per order:** the highest fee in the bag applies.
  - **Charge for every item:** each item's fee × quantity.

  Orders above the free-delivery threshold always ship free. If any product's fee is "confirm on WhatsApp", the order shows delivery as *to be confirmed*.

### Safety

- The password exists only in Vercel's environment variables. Logins last 7 days, and after 8 wrong attempts login is blocked for 15 minutes.
- If the catalog was changed in another tab or on another phone, a save is refused instead of overwriting those changes, and you're asked to reload.
- Use **Download backup** (Settings) from time to time to keep a copy of everything.

---

## 2. Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD`. Then start the dev server:

```bash
npm run dev
```

- Store: http://localhost:5173
- Control center: http://localhost:5173/admin/

When it runs locally without Redis or Blob, the catalog is saved to `.data/catalog.json` and photos to `public/uploads/`. Both folders are git-ignored and exist only on your computer.

---

## 3. Project structure

```
├── index.html                 ← store page: title, SEO & social tags
├── admin/index.html           ← control center page (/admin)
├── api/                       ← Vercel Functions (the only server code)
│   ├── catalog.js             ← GET  /api/catalog         public catalog
│   ├── admin/login.js         ← POST /api/admin/login
│   ├── admin/session.js       ← GET  /api/admin/session
│   ├── admin/catalog.js       ← GET/PUT /api/admin/catalog
│   ├── admin/upload.js        ← POST /api/admin/upload    photos → Vercel Blob
│   └── _lib/                  ← auth, storage (Redis / Blob / local files)
├── shared/catalog.js          ← catalog rules & validation used everywhere
└── src/
    ├── config/store.js        ← brand name, texts, FAQ, sample settings
    ├── data/products.js       ← sample products (used until you publish)
    ├── context/               ← live catalog + bag (cart)
    ├── utils/                 ← WhatsApp message, delivery pricing, formatting
    ├── components/            ← storefront sections
    └── admin/                 ← control center app
```

---

## 4. Customize the brand

Products, collections, the WhatsApp number, delivery and announcements are managed in the **control center**.
A few things still live in the code:

- **Brand name, tagline, logo and currency:** `STORE_CONFIG` in `src/config/store.js`. Also update `<title>` and the `og:` tags in `index.html`.
- **Hero, brand story, FAQ, gallery and testimonials:** `src/config/store.js`.
  > Replace the general FAQ answers with your real delivery, payment and return policies.
  > Testimonials are labelled placeholders: replace them with real customer messages, or set `SHOW_TESTIMONIALS = false`.
- **Colors and fonts:** design tokens at the top of `src/styles/global.css`.
- **WhatsApp message wording:** `WHATSAPP_TEXT` in `src/config/store.js`. You can translate it, for example to French or Darija.

---

## 5. How WhatsApp checkout works

1. The customer taps **Order via WhatsApp** in the bag.
2. The site builds a message from the bag and opens `https://wa.me/<your number>?text=<message>`. This opens the WhatsApp app on phones and WhatsApp Web on computers.
3. The customer presses send. **The order is not confirmed until you reply.**
4. The bag stays saved, and the customer can clear it once you confirm.

```
Hello! I'd like to place an order from Maison Éclat.

Order details:
• Layered Gold-Tone Chain Necklace × 1 — 229 MAD
   Ref. N02 · 229 MAD each
• Stainless Steel Hoop Earrings (Gold tone) × 1 — 129 MAD
   Ref. E01 · 129 MAD each

Subtotal: 358 MAD
Delivery: 30 MAD
Total: 388 MAD
```

---

## 6. Deploy

The project is set up for **Vercel**. Every push to `main` deploys automatically, and Vercel detects Vite plus the `api/` functions with no extra configuration.

Static-only hosts (Netlify drag-and-drop, GitHub Pages) can still serve the store, but they show the sample catalog and the control center won't work, because it needs Vercel Functions.
