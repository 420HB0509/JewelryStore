# Maison Éclat — Jewelry Storefront with WhatsApp Checkout

A lightweight, mobile-first jewelry storefront built with **React + Vite**.
Customers browse, add pieces to a bag, and send a pre-filled order to you on **WhatsApp**.
You confirm availability, delivery and payment by hand in the chat.

- No backend, database, accounts or payment gateway
- Cart runs in the browser and is saved in `localStorage`, so it survives a refresh
- Builds to static files you can host anywhere for free

---

## 1. Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173.

To build the production files into `dist/`:

```bash
npm run build
```

```bash
npm run preview
```

---

## 2. Project structure

```
├── index.html                 ← page title, SEO & social-sharing tags, fonts
├── public/
│   └── favicon.svg            ← browser tab icon (put your own images here too)
└── src/
    ├── config/store.js        ← ★ brand, WhatsApp number, delivery, texts, FAQ
    ├── data/products.js       ← ★ product catalog & categories
    ├── context/CartContext.jsx← cart logic, validation, localStorage
    ├── utils/
    │   ├── whatsapp.js        ← builds the order message + wa.me link
    │   ├── pricing.js         ← subtotal / delivery / total rules
    │   ├── format.js          ← price formatting ("1 290 MAD")
    │   └── image.js           ← responsive image URLs
    ├── hooks/                 ← dialog focus/scroll handling, scroll reveal
    ├── styles/global.css      ← design tokens (colors, fonts), buttons, layout
    └── components/            ← one .jsx + .css per section
        AnnouncementBar, Header, Hero, CollectionGrid, ProductGrid,
        ProductCard, ProductDetailModal, CartDrawer, WhatsAppCheckout,
        BrandStory, BestSellers, Testimonials, InstagramGallery, FAQ,
        Footer, FloatingWhatsApp, Toast, QuantityStepper, Price
```

Day to day, you only need to edit the two ★ files.

---

## 3. Customize your store

### WhatsApp number (most important)

In `src/config/store.js`:

```js
whatsappNumber: "212600000000",
```

Use the international format: country code followed by the number, **without** `+`, spaces or the leading `0`.
For example, the Moroccan number `06 12 34 56 78` becomes `212612345678`.

### Brand name, logo, Instagram

Also in `src/config/store.js`:

```js
name: "Maison Éclat",
tagline: "Everyday jewelry, beautifully priced",
logoUrl: null,                 // or "/logo.svg" after adding it to /public
instagramUrl: "https://instagram.com/yourbrand",
instagramHandle: "@yourbrand",
```

Then update the `<title>` and the `og:` tags in `index.html` so search engines and link previews show your name.

### Delivery fee and free-delivery threshold

```js
deliveryFee: null,          // null = "confirmed on WhatsApp"; or a number, e.g. 30
freeDeliveryThreshold: 500, // free delivery from 500 MAD; null to turn it off
```

- `deliveryFee: null`: the bag shows "Delivery: Confirmed on WhatsApp" and the message says "To be confirmed".
- `deliveryFee: 30`: the bag adds 30 MAD to the total.
- When the subtotal reaches `freeDeliveryThreshold`, delivery shows as **Free**, and the announcement bar and progress bar update to match.

### Announcement bar, hero, collections, story, FAQ, testimonials

Every text on the page lives in `src/config/store.js`: `ANNOUNCEMENTS`, `HERO`, `COLLECTIONS`, `BRAND_STORY`, `MATERIALS`, `TESTIMONIALS`, `GALLERY`, `FAQS` and `WHATSAPP_TEXT`. You can translate any of them, for example to French or Darija.

> **Please update the FAQ answers** with your real delivery zones, timing, payment methods and return policy.
> The current answers are general on purpose, so they don't promise anything you haven't decided.

> **Testimonials** are clearly marked placeholders. Replace them with real customer messages (with permission) and set `isPlaceholder: false`. To hide the section, set `SHOW_TESTIMONIALS = false`.

### Products

Edit `src/data/products.js`. Each product looks like this:

```js
{
  id: "N01",                         // unique reference, shown in WhatsApp orders
  name: "Gold-Plated Minimalist Necklace",
  price: 189,                        // MAD
  originalPrice: 229,                // optional; shows a crossed-out price and a −% badge
  category: "necklaces",             // necklaces | earrings | rings | bracelets | sets
  images: ["https://…/main.jpg", "https://…/second.jpg"],
  description: "A fine, delicate chain…",
  material: "Gold-plated alloy",     // be accurate: never write "solid gold" unless it is
  details: ["Lobster clasp closure"],// optional, only verified facts
  variants: {                        // optional
    colors: [{ name: "Gold tone", hex: "#C9A45C" }],
    sizes: ["40 cm", "45 cm"],       // customers must pick one before adding to the bag
  },
  badge: "bestseller",               // "bestseller" | "new" | null
  availability: "in_stock",          // "in_stock" | "low_stock" | "sold_out"
}
```

- **Add a product:** copy a block, give it a new `id`, and edit it.
- **Mark a product as sold out:** set `availability: "sold_out"`. The button is disabled, the piece moves to the end of the grid, and anyone who already has it in their bag is asked to remove it before ordering.
- **Change prices:** edit `price`. Bags always use the latest prices from this file, never an old saved price.
- **Avoid unverified claims:** don't write "hypoallergenic", "waterproof" or "tarnish-free" unless you have confirmed them for that piece.

### Images

The sample photos are free Unsplash images loaded by URL. To use your own:

1. Put the files in `public/images/`, for example `public/images/necklace-01.jpg`.
2. Reference them as `"images/necklace-01.jpg"` in `products.js` or `store.js`. Leave out the leading slash so the path also works on GitHub Pages.

Use portrait photos (ratio **4:5**, about 1200×1500 px) compressed to WebP or JPG under ~250 KB each.
Any other image host works too: just paste the full URL.

### Colors and fonts

The design tokens are at the top of `src/styles/global.css` (`--ivory`, `--champagne`, `--ink`, …).
The fonts are Cormorant Garamond and Jost, loaded in `index.html`.

---

## 4. How WhatsApp checkout works

1. The customer taps **Order via WhatsApp** in the bag.
2. The site builds a message from the bag and opens
   `https://wa.me/<your number>?text=<encoded message>`. This opens the WhatsApp app on phones and WhatsApp Web on computers.
3. The customer presses send. **The order is not confirmed until you reply.**
4. The bag stays saved, and the customer can clear it themselves once you confirm.

Example message:

```
Hello! I'd like to place an order from Maison Éclat.

Order details:
• Layered Gold-Tone Chain Necklace × 1 — 229 MAD
   Ref. N02 · 229 MAD each
• Stainless Steel Hoop Earrings (Gold tone) × 1 — 129 MAD
   Ref. E01 · 129 MAD each

Subtotal: 358 MAD
Delivery: To be confirmed
Total: 358 MAD + delivery if applicable

Could you please confirm availability and delivery details?
Thank you!
```

The checkout button is disabled when the bag is empty or contains sold-out pieces.

---

## 5. Deploy (free static hosting)

`vite.config.js` uses `base: "./"`, so the same build works on all of these hosts.

### Netlify

- **Drag & drop:** run `npm run build`, then drag the `dist` folder onto https://app.netlify.com/drop.
- **From Git:** connect the repo and set the build command to `npm run build` and the publish directory to `dist`.

### Vercel

Import the repository at https://vercel.com/new. Vercel detects Vite automatically: the build command is `npm run build` and the output directory is `dist`.

### GitHub Pages

1. Push the project to a GitHub repository.
2. Build the site:

   ```bash
   npm run build
   ```

3. Publish the `dist` folder:

   ```bash
   npx gh-pages -d dist
   ```

4. In the repository, go to **Settings → Pages** and select the `gh-pages` branch.

### After deploying

- Open the live site on your phone, add a piece to the bag, and tap **Order via WhatsApp** to check that it reaches your number.
- Update `og:image` and the other `og:` tags in `index.html`. Use a full URL for the image so link previews on WhatsApp and Instagram look right.
