import { useMemo, useState } from "react";
import { Copy, ImageOff, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AVAILABILITY, nextProductId } from "../../../shared/catalog.js";
import { formatPrice } from "../../utils/format.js";
import { imgSrc } from "../../utils/image.js";
import { STOCK_LABELS } from "./ProductEditor.jsx";
import { ConfirmDialog, Pill, Switch } from "./ui.jsx";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "visible", label: "On the store" },
  { id: "hidden", label: "Hidden" },
  { id: "sold_out", label: "Out of stock" },
  { id: "low_stock", label: "Few left" },
];

const matchesStatus = (p, status) => {
  if (status === "visible") return p.active;
  if (status === "hidden") return !p.active;
  if (status === "sold_out" || status === "low_stock") return p.availability === status;
  return true;
};

export default function ProductsTab({ catalog, commit, onEdit, onAdd }) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("all");
  const [status, setStatus] = useState("all");
  const [menuFor, setMenuFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const collectionName = useMemo(
    () => Object.fromEntries(catalog.collections.map((c) => [c.id, c.name])),
    [catalog.collections]
  );

  const products = catalog.products;
  const counts = {
    total: products.length,
    visible: products.filter((p) => p.active).length,
    soldOut: products.filter((p) => p.availability === "sold_out").length,
  };

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const textMatch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    return textMatch && (collection === "all" || p.category === collection) && matchesStatus(p, status);
  });

  const update = (id, patch, message) =>
    commit((cat) => {
      cat.products = cat.products.map((p) => (p.id === id ? { ...p, ...patch } : p));
      return cat;
    }, message);

  const duplicate = (product) => {
    setMenuFor(null);
    commit((cat) => {
      const index = cat.products.findIndex((p) => p.id === product.id);
      const copy = {
        ...structuredClone(product),
        id: nextProductId(cat.products, collectionName[product.category]),
        name: `${product.name} (copy)`,
        active: false,
      };
      cat.products.splice(index + 1, 0, copy);
      return cat;
    }, "Copy created — it's hidden until you edit and turn it on.");
  };

  const remove = async () => {
    const product = toDelete;
    setToDelete(null);
    await commit((cat) => {
      cat.products = cat.products.filter((p) => p.id !== product.id);
      return cat;
    }, `“${product.name}” deleted`);
  };

  return (
    <section className="tab">
      <div className="tab__head">
        <div>
          <h1>Products</h1>
          <p className="tab__sub">
            {counts.total} products · {counts.visible} on the store
            {counts.soldOut > 0 && ` · ${counts.soldOut} out of stock`}
          </p>
        </div>
        <button type="button" className="abtn abtn--primary" onClick={onAdd}>
          <Plus size={18} /> Add product
        </button>
      </div>

      <div className="toolbar">
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or reference"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </label>
        <select
          className="ainput toolbar__select"
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          aria-label="Filter by collection"
        >
          <option value="all">All collections</option>
          {catalog.collections
            .filter((c) => c.kind === "category")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div className="filters" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`fchip ${status === f.id ? "is-active" : ""}`}
            aria-pressed={status === f.id}
            onClick={() => setStatus(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>{products.length ? "No products match these filters." : "No products yet."}</p>
          {products.length ? (
            <button
              type="button"
              className="abtn abtn--ghost"
              onClick={() => {
                setQuery("");
                setCollection("all");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          ) : (
            <button type="button" className="abtn abtn--primary" onClick={onAdd}>
              <Plus size={18} /> Add your first product
            </button>
          )}
        </div>
      ) : (
        <ul className="plist">
          {filtered.map((p) => (
            <li key={p.id} className={`prow ${p.active ? "" : "is-hidden"}`}>
              <button type="button" className="prow__thumb" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}>
                {p.images[0] ? (
                  <img src={imgSrc(p.images[0], 160)} alt="" loading="lazy" />
                ) : (
                  <ImageOff size={20} strokeWidth={1.4} />
                )}
              </button>

              <div className="prow__info">
                <button type="button" className="prow__name" onClick={() => onEdit(p)}>
                  {p.name}
                </button>
                <p className="prow__meta">
                  {collectionName[p.category] || "No collection"} · Ref. {p.id}
                </p>
                <p className="prow__price">
                  {formatPrice(p.price)}
                  {p.originalPrice && <s>{formatPrice(p.originalPrice)}</s>}
                  {p.shippingFee !== null && (
                    <span className="prow__ship">
                      {p.shippingFee === 0 ? "Free delivery" : `Delivery ${formatPrice(p.shippingFee)}`}
                    </span>
                  )}
                </p>
                <div className="prow__pills">
                  {!p.active && <Pill tone="muted">Hidden</Pill>}
                  {p.availability === "sold_out" && <Pill tone="danger">Out of stock</Pill>}
                  {p.availability === "low_stock" && <Pill tone="warn">Few left</Pill>}
                  {p.badge === "bestseller" && <Pill>Best seller</Pill>}
                  {p.badge === "new" && <Pill>New</Pill>}
                </div>
              </div>

              <div className="prow__controls">
                <label className="prow__stock">
                  <span className="sr-only">Stock for {p.name}</span>
                  <select
                    className={`ainput ainput--sm stock--${p.availability}`}
                    value={p.availability}
                    onChange={(e) =>
                      update(p.id, { availability: e.target.value }, `${p.name}: ${STOCK_LABELS[e.target.value].toLowerCase()}`)
                    }
                  >
                    {AVAILABILITY.map((a) => (
                      <option key={a} value={a}>
                        {STOCK_LABELS[a]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="prow__visible">
                  <Switch
                    checked={p.active}
                    label={`Show ${p.name} on store`}
                    onChange={(v) => {
                      if (v && !p.images.length) {
                        onEdit(p);
                        return;
                      }
                      update(p.id, { active: v }, v ? `${p.name} is now on the store` : `${p.name} is now hidden`);
                    }}
                  />
                  <span className="prow__visible-label">{p.active ? "Visible" : "Hidden"}</span>
                </div>

                <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => onEdit(p)}>
                  <Pencil size={15} /> Edit
                </button>

                <div className="menu">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`More actions for ${p.name}`}
                    aria-expanded={menuFor === p.id}
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menuFor === p.id && (
                    <>
                      <div className="menu__scrim" onClick={() => setMenuFor(null)} />
                      <div className="menu__list" role="menu">
                        <button type="button" role="menuitem" onClick={() => duplicate(p)}>
                          <Copy size={15} /> Duplicate
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="is-danger"
                          onClick={() => {
                            setMenuFor(null);
                            setToDelete(p);
                          }}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this product?"
        confirmLabel="Delete product"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      >
        <p>
          <strong>{toDelete?.name}</strong> will be removed from your store for good.
        </p>
        <p className="field__hint">Tip: to take it down temporarily, turn off “Visible” instead.</p>
      </ConfirmDialog>
    </section>
  );
}
