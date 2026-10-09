import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { AVAILABILITY, nextProductId } from "../../../shared/catalog.js";
import { discountPercent, formatPrice } from "../../utils/format.js";
import ImageManager from "./ImageManager.jsx";
import { ConfirmDialog, Field, Modal, MoneyInput, Switch } from "./ui.jsx";

export const STOCK_LABELS = {
  in_stock: "In stock",
  low_stock: "Only a few left",
  sold_out: "Out of stock",
};

const SIZE_PRESETS = [
  { label: "Ring sizes 50–60", sizes: ["50", "52", "54", "56", "58", "60"] },
  { label: "Necklace lengths", sizes: ["40 cm", "45 cm", "50 cm"] },
  { label: "Bracelet sizes", sizes: ["S", "M", "L"] },
];

const toInput = (n) => (n === null || n === undefined ? "" : String(n));
const toNumber = (s) => (String(s).trim() === "" ? null : Number(s));

function toDraft(product, catalog) {
  const firstCollection = catalog.collections.find((c) => c.kind === "category");
  const p = product || {
    id: "",
    name: "",
    price: null,
    originalPrice: null,
    category: firstCollection?.id || "",
    images: [],
    description: "",
    material: "",
    details: [],
    variants: {},
    badge: null,
    availability: "in_stock",
    active: true,
    shippingFee: null,
  };
  return {
    ...p,
    price: toInput(p.price),
    originalPrice: toInput(p.originalPrice),
    detailsText: (p.details || []).join("\n"),
    sizes: p.variants?.sizes || [],
    colors: p.variants?.colors || [],
    deliveryChoice: p.shippingFee === null ? "default" : p.shippingFee === 0 ? "free" : "custom",
    customFee: p.shippingFee ? String(p.shippingFee) : "",
  };
}

function validate(d) {
  const errors = {};
  if (!d.name.trim()) errors.name = "Give the product a name.";
  const price = toNumber(d.price);
  if (price === null || !(price > 0)) errors.price = "Enter a price above 0.";
  const was = toNumber(d.originalPrice);
  if (was !== null && price && !(was > price)) errors.originalPrice = "The “before” price must be higher than the price.";
  if (!d.category) errors.category = "Choose a collection.";
  if (d.deliveryChoice === "custom" && !(toNumber(d.customFee) > 0)) errors.customFee = "Enter a delivery fee above 0.";
  if (d.active && !d.images.length) errors.images = "Add at least one photo, or turn off “Show on store” to save it as a draft.";
  return errors;
}

export default function ProductEditor({ product, catalog, commit, onClose, uploadsMode }) {
  const isNew = !product;
  const [draft, setDraft] = useState(() => toDraft(product, catalog));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [sizeInput, setSizeInput] = useState("");

  const categories = catalog.collections.filter((c) => c.kind === "category");
  const { settings } = catalog;

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const addSizes = (list) => {
    const next = [...draft.sizes];
    list.forEach((s) => {
      const v = s.trim();
      if (v && !next.includes(v)) next.push(v);
    });
    set({ sizes: next });
  };

  const price = toNumber(draft.price);
  const was = toNumber(draft.originalPrice);
  const discount = price && was ? discountPercent(price, was) : 0;

  const defaultFeeLabel = useMemo(() => {
    if (settings.deliveryFee === null) return "confirmed on WhatsApp";
    if (settings.deliveryFee === 0) return "free";
    return formatPrice(settings.deliveryFee);
  }, [settings.deliveryFee]);

  const requestClose = () => (dirty ? setConfirmClose(true) : onClose());

  const save = async () => {
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector(".modal__body .has-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const shippingFee =
      draft.deliveryChoice === "default" ? null : draft.deliveryChoice === "free" ? 0 : toNumber(draft.customFee);
    const variants = {};
    if (draft.colors.filter((c) => c.name.trim()).length)
      variants.colors = draft.colors.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), hex: c.hex }));
    if (draft.sizes.length) variants.sizes = draft.sizes;

    const clean = {
      id: draft.id,
      name: draft.name.trim(),
      price,
      originalPrice: was,
      category: draft.category,
      images: draft.images,
      description: draft.description.trim(),
      material: draft.material.trim(),
      details: draft.detailsText.split("\n").map((s) => s.trim()).filter(Boolean),
      variants,
      badge: draft.badge || null,
      availability: draft.availability,
      active: draft.active,
      shippingFee,
    };

    setSaving(true);
    const ok = await commit((cat) => {
      if (isNew) {
        const collectionName = cat.collections.find((c) => c.id === clean.category)?.name;
        // New products appear first in the shop
        cat.products.unshift({ ...clean, id: nextProductId(cat.products, collectionName) });
      } else {
        cat.products = cat.products.map((p) => (p.id === clean.id ? clean : p));
      }
      return cat;
    }, isNew ? `“${clean.name}” added to your store` : `“${clean.name}” saved`);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <>
      <Modal
        open
        onClose={requestClose}
        size="lg"
        title={isNew ? "New product" : "Edit product"}
        subtitle={isNew ? "Fill in the details, then save." : `Reference ${draft.id}`}
        footer={
          <>
            <button type="button" className="abtn abtn--ghost" onClick={requestClose}>
              Cancel
            </button>
            <button type="button" className="abtn abtn--primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add product" : "Save changes"}
            </button>
          </>
        }
      >
        <div className="editor">
          {/* Visibility first: the most common quick decision */}
          <section className="editor__card editor__status">
            <Switch
              checked={draft.active}
              onChange={(v) => set({ active: v })}
              label="Show on store"
              showLabel
            />
            <p className="field__hint">
              {draft.active
                ? "Customers can see this product."
                : "Hidden: only you can see it here. Turn it on when it's ready."}
            </p>
            <Field label="Stock" htmlFor="pe-stock">
              <div className="segmented" role="radiogroup" aria-label="Stock">
                {AVAILABILITY.map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={draft.availability === a}
                    className={`segmented__opt segmented__opt--${a} ${draft.availability === a ? "is-active" : ""}`}
                    onClick={() => set({ availability: a })}
                  >
                    {STOCK_LABELS[a]}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <section className="editor__card">
            <h3>Photos</h3>
            <Field error={errors.images} hint="The first photo is the main one. Portrait photos (4:5) look best.">
              <ImageManager images={draft.images} onChange={(images) => set({ images })} uploadsMode={uploadsMode} />
            </Field>
          </section>

          <section className="editor__card">
            <h3>Details</h3>
            <Field label="Product name" htmlFor="pe-name" error={errors.name}>
              <input
                id="pe-name"
                className="ainput"
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="e.g. Gold-Plated Minimalist Necklace"
                maxLength={120}
              />
            </Field>
            <Field label="Collection" htmlFor="pe-col" error={errors.category}>
              <select
                id="pe-col"
                className="ainput"
                value={draft.category}
                onChange={(e) => set({ category: e.target.value })}
              >
                {!draft.category && <option value="">Choose…</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {!c.active ? " (turned off)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" htmlFor="pe-desc" optional>
              <textarea
                id="pe-desc"
                className="ainput"
                rows={4}
                value={draft.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="A short, friendly description of the piece."
                maxLength={2000}
              />
            </Field>
            <Field
              label="Material"
              htmlFor="pe-mat"
              optional
              hint="Be accurate: e.g. “Gold-plated alloy” or “Gold-tone stainless steel”. Never write solid gold unless it is."
            >
              <input
                id="pe-mat"
                className="ainput"
                value={draft.material}
                onChange={(e) => set({ material: e.target.value })}
                maxLength={160}
              />
            </Field>
            <Field
              label="Extra details"
              htmlFor="pe-details"
              optional
              hint="One per line, e.g. “Lobster clasp closure”. Only facts you've checked."
            >
              <textarea
                id="pe-details"
                className="ainput"
                rows={3}
                value={draft.detailsText}
                onChange={(e) => set({ detailsText: e.target.value })}
              />
            </Field>
          </section>

          <section className="editor__card">
            <h3>Price</h3>
            <div className="editor__row">
              <Field label="Price" htmlFor="pe-price" error={errors.price}>
                <MoneyInput id="pe-price" value={draft.price} onChange={(v) => set({ price: v })} />
              </Field>
              <Field
                label="Price before discount"
                htmlFor="pe-was"
                optional
                error={errors.originalPrice}
                hint="Shows a crossed-out price and a −% badge."
              >
                <MoneyInput
                  id="pe-was"
                  value={draft.originalPrice}
                  onChange={(v) => set({ originalPrice: v })}
                  placeholder="—"
                />
              </Field>
            </div>
            {price > 0 && (
              <p className="editor__preview">
                Customers see: <strong>{formatPrice(price)}</strong>
                {discount > 0 && (
                  <>
                    {" "}
                    <s>{formatPrice(was)}</s> <span className="pill pill--dark">−{discount}%</span>
                  </>
                )}
              </p>
            )}
          </section>

          <section className="editor__card">
            <h3>Delivery</h3>
            <div className="radios" role="radiogroup" aria-label="Delivery fee">
              <label className={`radio ${draft.deliveryChoice === "default" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="pe-delivery"
                  checked={draft.deliveryChoice === "default"}
                  onChange={() => set({ deliveryChoice: "default" })}
                />
                <span>
                  <strong>Use the store's delivery fee</strong>
                  <small>Currently {defaultFeeLabel}. Change it in “Delivery & settings”.</small>
                </span>
              </label>
              <label className={`radio ${draft.deliveryChoice === "free" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="pe-delivery"
                  checked={draft.deliveryChoice === "free"}
                  onChange={() => set({ deliveryChoice: "free" })}
                />
                <span>
                  <strong>Free delivery for this product</strong>
                </span>
              </label>
              <label className={`radio ${draft.deliveryChoice === "custom" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="pe-delivery"
                  checked={draft.deliveryChoice === "custom"}
                  onChange={() => set({ deliveryChoice: "custom" })}
                />
                <span>
                  <strong>Its own delivery fee</strong>
                  <small>For bulky or special items.</small>
                </span>
              </label>
            </div>
            {draft.deliveryChoice === "custom" && (
              <Field label="Delivery fee for this product" htmlFor="pe-fee" error={errors.customFee}>
                <MoneyInput id="pe-fee" value={draft.customFee} onChange={(v) => set({ customFee: v })} />
              </Field>
            )}
          </section>

          <section className="editor__card">
            <h3>Options</h3>
            <Field
              label="Sizes"
              htmlFor="pe-size"
              optional
              hint="Customers must choose one before adding to the bag. Press Enter after each size."
            >
              <div className="tags">
                {draft.sizes.map((s) => (
                  <span key={s} className="tag">
                    {s}
                    <button
                      type="button"
                      onClick={() => set({ sizes: draft.sizes.filter((x) => x !== s) })}
                      aria-label={`Remove size ${s}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <input
                  id="pe-size"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && sizeInput.trim()) {
                      e.preventDefault();
                      addSizes(sizeInput.split(","));
                      setSizeInput("");
                    } else if (e.key === "Backspace" && !sizeInput && draft.sizes.length) {
                      set({ sizes: draft.sizes.slice(0, -1) });
                    }
                  }}
                  onBlur={() => {
                    if (sizeInput.trim()) {
                      addSizes(sizeInput.split(","));
                      setSizeInput("");
                    }
                  }}
                  placeholder={draft.sizes.length ? "Add another…" : "e.g. 54"}
                />
              </div>
              <div className="presets">
                {SIZE_PRESETS.map((p) => (
                  <button key={p.label} type="button" className="chip-btn" onClick={() => addSizes(p.sizes)}>
                    + {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Colors" optional hint="Leave empty if the product comes in one color.">
              <div className="colors">
                {draft.colors.map((c, i) => (
                  <div key={i} className="colors__row">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) =>
                        set({ colors: draft.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) })
                      }
                      aria-label="Color swatch"
                    />
                    <input
                      className="ainput"
                      value={c.name}
                      placeholder="Color name, e.g. Gold tone"
                      onChange={(e) =>
                        set({ colors: draft.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })
                      }
                      maxLength={40}
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => set({ colors: draft.colors.filter((_, j) => j !== i) })}
                      aria-label="Remove color"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {draft.colors.length < 12 && (
                  <button
                    type="button"
                    className="alink"
                    onClick={() => set({ colors: [...draft.colors, { name: "", hex: "#c9a45c" }] })}
                  >
                    <Plus size={14} /> Add a color
                  </button>
                )}
              </div>
            </Field>
          </section>

          <section className="editor__card">
            <h3>Label</h3>
            <div className="segmented" role="radiogroup" aria-label="Label">
              {[
                [null, "None"],
                ["new", "New"],
                ["bestseller", "Best seller"],
              ].map(([value, text]) => (
                <button
                  key={text}
                  type="button"
                  role="radio"
                  aria-checked={draft.badge === value}
                  className={`segmented__opt ${draft.badge === value ? "is-active" : ""}`}
                  onClick={() => set({ badge: value })}
                >
                  {text}
                </button>
              ))}
            </div>
            <p className="field__hint">“Best seller” products also appear in the Best Sellers collection.</p>
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmClose}
        title="Discard your changes?"
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      >
        <p>You have unsaved changes to this product.</p>
      </ConfirmDialog>
    </>
  );
}
