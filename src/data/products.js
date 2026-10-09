/* =============================================================
   PRODUCT CATALOG
   -------------------------------------------------------------
   Add, edit or remove products here. Fields:

   id            Unique reference (shown to you in WhatsApp orders)
   name          Product name
   price         Price in the store currency (number)
   originalPrice Optional. Higher "was" price to show a discount
   category      One of the ids in CATEGORIES below
   images        Array of image URLs (first one is the main image).
                 Use full URLs or files in /public, e.g. "/images/ring.jpg"
   description   Short description
   material      Accurate material description — never claim solid gold
   details       Optional extra bullet points (only TRUE, verified facts:
                 don't add "hypoallergenic", "waterproof" or
                 "tarnish-free" unless you have confirmed it)
   variants      Optional { colors: [{ name, hex }], sizes: [...] }
                 Customers must pick a size when sizes are listed.
   badge         Optional "bestseller" | "new"
   availability  "in_stock" | "low_stock" | "sold_out"
   ============================================================= */

export const CATEGORIES = [
  { id: "necklaces", label: "Necklaces" },
  { id: "earrings", label: "Earrings" },
  { id: "rings", label: "Rings" },
  { id: "bracelets", label: "Bracelets" },
  { id: "sets", label: "Jewelry Sets" },
];

const u = (id) => `https://images.unsplash.com/photo-${id}`;

export const PRODUCTS = [
  {
    id: "N01",
    name: "Gold-Plated Minimalist Necklace",
    price: 189,
    originalPrice: 229,
    category: "necklaces",
    images: [u("1599459183200-59c7687a0275"), u("1620656798579-1984d9e87df7")],
    description:
      "A fine, delicate chain designed to be worn alone or layered. The kind of necklace you put on and never take off.",
    material: "Gold-plated alloy",
    details: ["Lobster clasp closure"],
    variants: {
      sizes: ["40 cm", "45 cm"],
    },
    badge: "bestseller",
    availability: "in_stock",
  },
  {
    id: "N02",
    name: "Layered Gold-Tone Chain Necklace",
    price: 229,
    category: "necklaces",
    images: [u("1635767798638-3e25273a8236"), u("1611652022419-a9419f74343d")],
    description:
      "Three fine chains of different lengths, pre-layered so they sit beautifully without tangling.",
    material: "Gold-tone stainless steel",
    details: ["Three layered chains on one clasp"],
    badge: "new",
    availability: "in_stock",
  },
  {
    id: "N03",
    name: "Pearl Drop Pendant Necklace",
    price: 199,
    category: "necklaces",
    images: [u("1611085583191-a3b181a88401"), u("1610694955371-d4a3e0ce4b52")],
    description:
      "A single faux pearl suspended from a fine chain — soft, feminine and effortlessly elegant.",
    material: "Gold-plated chain with faux pearl",
    badge: null,
    availability: "low_stock",
  },
  {
    id: "N04",
    name: "Classic Faux Pearl Strand",
    price: 249,
    category: "necklaces",
    images: [u("1515562141207-7a88fb7ce338")],
    description:
      "A timeless strand of faux pearls with a gold-tone clasp. Elegant with a little black dress or a simple white shirt.",
    material: "Faux pearls, gold-tone clasp",
    badge: null,
    availability: "in_stock",
  },
  {
    id: "E01",
    name: "Stainless Steel Hoop Earrings",
    price: 129,
    category: "earrings",
    images: [u("1608508644127-ba99d7732fee"), u("1584302179602-e4c3d3fd629d")],
    description:
      "Polished everyday hoops with a gentle, rounded profile. Light enough to wear from morning to night.",
    material: "Stainless steel, gold-tone or silver-tone finish",
    variants: {
      colors: [
        { name: "Gold tone", hex: "#C9A45C" },
        { name: "Silver tone", hex: "#C8C8C8" },
      ],
    },
    badge: "bestseller",
    availability: "in_stock",
  },
  {
    id: "E02",
    name: "Pearl Detail Earrings",
    price: 149,
    originalPrice: 179,
    category: "earrings",
    images: [u("1617038220319-276d3cfab638"), u("1617038260897-41a1f14a8ca0")],
    description:
      "Sculptural gold-tone earrings finished with a faux pearl. A refined touch for work, dinners and weddings alike.",
    material: "Gold-plated alloy with faux pearl",
    badge: "bestseller",
    availability: "in_stock",
  },
  {
    id: "E03",
    name: "Flower Stud Earrings",
    price: 99,
    category: "earrings",
    images: [u("1626784215021-2e39ccf971cd")],
    description:
      "Petite floral studs with sparkling stones — a sweet, polished finish to any look.",
    material: "Gold-plated alloy with glass stones",
    badge: "new",
    availability: "in_stock",
  },
  {
    id: "R01",
    name: "Minimalist Band Ring",
    price: 89,
    category: "rings",
    images: [u("1622398925373-3f91b1e275f5"), u("1631982690223-8aa4be0a2497")],
    description:
      "A smooth, slim band with a soft shine. Wear one alone or stack several together.",
    material: "Gold-tone stainless steel",
    variants: {
      sizes: ["52", "54", "56", "58"],
    },
    badge: "bestseller",
    availability: "in_stock",
  },
  {
    id: "R02",
    name: "Silver-Tone Duo Rings",
    price: 109,
    category: "rings",
    images: [u("1627293509201-cd0c780043e6")],
    description:
      "Two sleek bands sold as a pair — modern, understated and easy to style.",
    material: "Stainless steel (silver tone)",
    variants: {
      sizes: ["52", "54", "56", "58"],
    },
    badge: null,
    availability: "in_stock",
  },
  {
    id: "R03",
    name: "Rose Stone Statement Ring",
    price: 129,
    category: "rings",
    images: [u("1603561591411-07134e71a2a9")],
    description:
      "A rectangular rose-colored stone framed in gold tone. Our boldest ring — made for being noticed.",
    material: "Gold-plated alloy with glass stone",
    variants: {
      sizes: ["52", "54", "56"],
    },
    badge: null,
    availability: "sold_out",
  },
  {
    id: "B01",
    name: "Layered Gold-Tone Bracelet",
    price: 159,
    category: "bracelets",
    images: [u("1602173574767-37ac01994b2a"), u("1611107683227-e9060eccd846")],
    description:
      "Chunky and fine chains combined into one bracelet for an instant layered look.",
    material: "Gold-tone stainless steel",
    details: ["Adjustable extender chain"],
    badge: "bestseller",
    availability: "in_stock",
  },
  {
    id: "B02",
    name: "Rose Gold-Tone Link Bracelet",
    price: 139,
    category: "bracelets",
    images: [u("1611591437281-460bfbe1220a")],
    description:
      "An openwork link bracelet in a warm rose gold tone — delicate, feminine and perfect for gifting.",
    material: "Rose gold-plated alloy",
    badge: null,
    availability: "in_stock",
  },
  {
    id: "S01",
    name: "Elegant Jewelry Gift Set",
    price: 329,
    originalPrice: 389,
    category: "sets",
    images: [u("1603974372039-adc49044b6bd"), u("1617038220319-276d3cfab638")],
    description:
      "A coordinated necklace and earring set, presented ready to gift. An easy, elegant present for someone special — or yourself.",
    material: "Gold-plated alloy",
    details: ["Includes 1 necklace and 1 pair of earrings"],
    badge: "new",
    availability: "in_stock",
  },
  {
    id: "S02",
    name: "Stacking Ring Trio",
    price: 179,
    category: "sets",
    images: [u("1608042314453-ae338d80c427")],
    description:
      "Three complementary rings designed to be stacked, mixed or worn on their own.",
    material: "Gold-plated alloy with glass stones",
    details: ["Set of 3 rings"],
    variants: {
      sizes: ["52", "54", "56"],
    },
    badge: null,
    availability: "low_stock",
  },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
