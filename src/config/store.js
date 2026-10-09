/* =============================================================
   STORE CONFIGURATION — edit this file to rebrand the storefront.
   Everything a shop owner normally changes lives here (or in
   src/data/products.js for the catalog).
   ============================================================= */

export const STORE_CONFIG = {
  // Brand
  name: "Maison Éclat",
  tagline: "Everyday jewelry, beautifully priced",
  // Optional logo image (e.g. "/logo.svg" placed in /public). Leave null to use the text wordmark.
  logoUrl: null,

  // Commerce
  currency: "MAD",

  // WhatsApp number in international format: country code + number,
  // NO spaces, NO "+" and NO leading zero. Example for Morocco: 212612345678
  whatsappNumber: "212600000000",

  instagramUrl: "https://instagram.com/yourbrand",
  instagramHandle: "@yourbrand",

  // Delivery
  // - null   -> delivery cost is confirmed on WhatsApp (nothing is invented)
  // - number -> flat fee in MAD added to the order total, e.g. 30
  deliveryFee: null,
  // Orders at or above this subtotal get free delivery. Set to null to disable.
  freeDeliveryThreshold: 500,

  // Max units of a single item per order line
  maxQuantityPerItem: 10,
};

/* Announcement bar — rotates through these messages.
   {threshold} is replaced with the free-delivery amount. */
export const ANNOUNCEMENTS = [
  "Free delivery on orders from {threshold}",
  "The new collection has arrived",
  "Order in a few taps — directly on WhatsApp",
];

/* Navigation */
export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/* Hero */
export const HERO = {
  eyebrow: "New Collection",
  headline: "The Little Details That Make You Shine",
  subheadline:
    "Discover elegant, everyday jewelry designed to elevate your style without the luxury price tag.",
  primaryCta: { label: "Shop the Collection", href: "#shop" },
  secondaryCta: { label: "Discover Our Story", href: "#about" },
  image:
    "https://images.unsplash.com/photo-1601821765780-754fa98637c1",
  imageAlt: "Woman in a white shirt wearing layered gold-tone necklaces",
  detailImage:
    "https://images.unsplash.com/photo-1635767798638-3e25273a8236",
  detailImageAlt: "Close-up of delicate layered gold-tone chain necklaces",
};

/* Collections — `filter` must match a product category id in products.js,
   or "bestseller" to show every product marked as a best seller. */
export const COLLECTIONS = [
  {
    id: "necklaces",
    name: "Necklaces",
    filter: "necklaces",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d",
    alt: "Layered gold-tone necklaces worn on the neckline",
  },
  {
    id: "earrings",
    name: "Earrings",
    filter: "earrings",
    image: "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9",
    alt: "Close-up of a gold earring and fine necklace",
  },
  {
    id: "rings",
    name: "Rings",
    filter: "rings",
    image: "https://images.unsplash.com/photo-1631982690223-8aa4be0a2497",
    alt: "Gold-tone rings displayed in a cream jewelry box",
  },
  {
    id: "bracelets",
    name: "Bracelets",
    filter: "bracelets",
    image: "https://images.unsplash.com/photo-1611107683227-e9060eccd846",
    alt: "A stack of gold-tone bangles and bracelets",
  },
  {
    id: "sets",
    name: "Jewelry Sets",
    filter: "sets",
    image: "https://images.unsplash.com/photo-1603974372039-adc49044b6bd",
    alt: "Gold-tone jewelry pieces arranged in a jewelry box",
  },
  {
    id: "bestsellers",
    name: "Best Sellers",
    filter: "bestseller",
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36",
    alt: "Hands wearing gold-tone rings and a bracelet",
  },
];

/* Brand story */
export const BRAND_STORY = {
  eyebrow: "Our Story",
  headline: "Everyday Elegance, Made Accessible",
  body: [
    "We believe beautiful jewelry shouldn't be reserved for special occasions — or special budgets. Every piece in our collection is chosen for its design, its finish and how easily it fits into the way you dress every day.",
    "We're transparent about what you're buying: our pieces are fashion jewelry, including gold-plated and gold-tone stainless steel styles. Each product page lists its material so you always know exactly what you're getting.",
  ],
  image: "https://images.unsplash.com/photo-1633810542706-90e5ff7557be",
  imageAlt: "Woman in a black top touching her gold-tone necklace",
  values: [
    {
      icon: "gem",
      title: "Thoughtfully selected designs",
      text: "Each piece is hand-picked for timeless shapes you'll reach for again and again.",
    },
    {
      icon: "tag",
      title: "Elegant styles, accessible prices",
      text: "The look of a fine jewelry boutique, priced for everyday wear and gifting.",
    },
    {
      icon: "message",
      title: "Personal service on WhatsApp",
      text: "Order in a few taps and talk to a real person who confirms every detail with you.",
    },
  ],
};

/* Material glossary shown in the brand story (keep these accurate). */
export const MATERIALS = [
  {
    name: "Gold-plated",
    text: "A thin layer of gold applied over a base metal. Not solid gold.",
  },
  {
    name: "Gold-tone stainless steel",
    text: "Stainless steel with a gold-colored finish. Contains no gold.",
  },
  {
    name: "Fashion jewelry",
    text: "Affordable pieces made from non-precious metals and materials.",
  },
];

/* Testimonials — PLACEHOLDERS. Replace with real customer messages
   (with their permission). Keep `isPlaceholder: true` until then so
   the site labels them honestly. Set SHOW_TESTIMONIALS to false to hide. */
export const SHOW_TESTIMONIALS = true;
export const TESTIMONIALS = [
  {
    quote:
      "Placeholder review — replace this with a real message from a customer about their favourite piece.",
    name: "Customer name",
    detail: "City",
    isPlaceholder: true,
  },
  {
    quote:
      "Placeholder review — a short, genuine quote about the ordering experience on WhatsApp works well here.",
    name: "Customer name",
    detail: "City",
    isPlaceholder: true,
  },
  {
    quote:
      "Placeholder review — share what a customer said about gifting, packaging or styling one of your pieces.",
    name: "Customer name",
    detail: "City",
    isPlaceholder: true,
  },
];

/* Instagram-style gallery — swap for your own posts. */
export const GALLERY = [
  { image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36", alt: "Gold-tone rings and bracelet on a hand" },
  { image: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7", alt: "Gold-tone necklace worn with a white top" },
  { image: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52", alt: "Fine layered necklace on the neckline" },
  { image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0", alt: "Gold-tone earrings with pearl detail on stone" },
  { image: "https://images.unsplash.com/photo-1590548784585-643d2b9f2925", alt: "Layered necklaces styled with a knit top" },
  { image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5", alt: "Two gold-tone band rings" },
];

/* FAQ — these answers are deliberately general. Replace them with your
   actual delivery zones, timings, payment methods and return policy. */
export const FAQS = [
  {
    q: "How do I place an order?",
    a: "Add the pieces you love to your bag, then tap “Order via WhatsApp”. A message with your order is prepared for you — just send it. We'll reply to confirm availability, delivery details and payment. Your order is only confirmed once we reply.",
  },
  {
    q: "What materials are the jewelry pieces made from?",
    a: "Our collection is fashion jewelry: mainly gold-plated pieces and gold-tone stainless steel. None of our pieces are solid gold. The exact material is listed on every product — and we're happy to answer questions on WhatsApp.",
  },
  {
    q: "What are the delivery options?",
    a: "Delivery options, fees and timing depend on your city. We confirm all of this with you on WhatsApp before your order is finalised, so there are no surprises.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Available payment methods are confirmed with you on WhatsApp when we finalise your order. No payment is taken on this website.",
  },
  {
    q: "Can I exchange or return an item?",
    a: "Please ask us about our exchange and return conditions on WhatsApp before ordering — we'll explain exactly what applies to your pieces.",
  },
  {
    q: "How can I contact the store?",
    a: "The fastest way is WhatsApp — tap the green button at the bottom of the screen. You can also send us a message on Instagram.",
  },
];

/* WhatsApp message templates. Translate freely (e.g. to French or Darija). */
export const WHATSAPP_TEXT = {
  greeting: "Hello! I'd like to place an order from {brand}.",
  orderDetails: "Order details:",
  subtotal: "Subtotal",
  delivery: "Delivery",
  deliveryTbc: "To be confirmed",
  deliveryFree: "Free",
  total: "Total",
  totalPlusDelivery: "{amount} + delivery if applicable",
  closing: "Could you please confirm availability and delivery details?",
  thanks: "Thank you!",
  generalEnquiry: "Hello {brand}! I have a question about your jewelry.",
  productEnquiry: "Hello {brand}! I have a question about the {product} (ref. {id}).",
};
