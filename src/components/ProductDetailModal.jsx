import { useState } from "react";
import { Check, Truck, X } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { Link } from "../router.jsx";
import { collectionPath } from "./CollectionGrid.jsx";
import { useCart, validateSelection } from "../context/CartContext.jsx";
import { useDialog } from "../hooks/useDialog.js";
import { discountPercent } from "../utils/format.js";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import { productDeliveryNote } from "../utils/pricing.js";
import { productEnquiryUrl } from "../utils/whatsapp.js";
import { WhatsAppIcon } from "./BrandIcons.jsx";
import Price from "./Price.jsx";
import QuantityStepper from "./QuantityStepper.jsx";
import "./ProductDetailModal.css";

const AVAILABILITY = {
  in_stock: { label: "In stock", tone: "ok" },
  low_stock: { label: "Only a few left", tone: "low" },
  sold_out: { label: "Sold out", tone: "out" },
};

export default function ProductDetailModal({ product, isOpen, openId, onClose }) {
  const ref = useDialog(isOpen, onClose);

  return (
    <div className={`pdm ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="pdm__backdrop" onClick={onClose} />
      <div
        className="pdm__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdm-title"
        ref={ref}
        tabIndex={-1}
      >
        <button className="icon-btn pdm__close" onClick={onClose} aria-label="Close product details">
          <X size={22} strokeWidth={1.4} />
        </button>
        {/* Keyed so selections reset every time a product is opened */}
        {product && <ModalBody key={openId} product={product} onClose={onClose} />}
      </div>
    </div>
  );
}

function ModalBody({ product, onClose }) {
  const { addItem, openCart, maxQty } = useCart();
  const { settings, allCollections, collections } = useCatalog();
  const colors = product.variants?.colors ?? [];
  const sizes = product.variants?.sizes ?? [];

  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState(colors[0]?.name);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : undefined);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const soldOut = product.availability === "sold_out";
  const availability = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock;
  const discount = discountPercent(product.price, product.originalPrice);
  const category = allCollections.find((c) => c.id === product.category)?.name;
  const categoryOnStore = collections.some((c) => c.id === product.category);
  const variant = { color, size };

  const handleAdd = () => {
    const check = validateSelection(product, variant, qty);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    const result = addItem(product.id, variant, qty);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setAdded(true);
  };

  const viewBag = () => {
    onClose();
    openCart();
  };

  return (
    <div className="pdm__grid">
      <div className="pdm__gallery">
        <div className="pdm__main">
          <img
            key={product.images[imageIndex]}
            src={imgSrc(product.images[imageIndex], 1000)}
            srcSet={imgSrcSet(product.images[imageIndex], [500, 800, 1000, 1400])}
            sizes="(min-width: 900px) 520px, 100vw"
            alt={`${product.name}${imageIndex ? ` — view ${imageIndex + 1}` : ""}`}
            width="1000"
            height="1250"
          />
          <div className="pdm__badges">
            {product.badge === "bestseller" && <span className="pcard__badge">Best Seller</span>}
            {product.badge === "new" && <span className="pcard__badge">New</span>}
            {discount > 0 && <span className="pcard__badge pcard__badge--sale">−{discount}%</span>}
          </div>
        </div>
        {product.images.length > 1 && (
          <div className="pdm__thumbs" role="group" aria-label="Product images">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`pdm__thumb ${i === imageIndex ? "is-active" : ""}`}
                onClick={() => setImageIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === imageIndex}
              >
                <img src={imgSrc(src, 200)} alt="" width="200" height="250" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pdm__info">
        {category &&
          (categoryOnStore ? (
            <Link to={collectionPath(product.category)} className="eyebrow pdm__collection" onClick={onClose}>
              {category}
            </Link>
          ) : (
            <span className="eyebrow">{category}</span>
          ))}
        <h2 id="pdm-title" className="pdm__title">
          {product.name}
        </h2>
        <div className="pdm__price">
          <Price price={product.price} originalPrice={product.originalPrice} />
          {discount > 0 && <span className="pdm__save">Save {discount}%</span>}
        </div>
        <p className={`pdm__stock pdm__stock--${availability.tone}`}>
          <span className="pdm__dot" aria-hidden="true" /> {availability.label}
        </p>

        <p className="pdm__delivery">
          <Truck size={16} strokeWidth={1.4} aria-hidden="true" /> {productDeliveryNote(product, settings)}
        </p>

        <p className="pdm__desc">{product.description}</p>

        <dl className="pdm__specs">
          <div>
            <dt>Material</dt>
            <dd>{product.material}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{product.id}</dd>
          </div>
        </dl>
        {product.details?.length > 0 && (
          <ul className="pdm__details">
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        {colors.length > 0 && (
          <fieldset className="pdm__field">
            <legend>
              Color: <strong>{color}</strong>
            </legend>
            <div className="pdm__swatches">
              {colors.map((c) => (
                <label key={c.name} className={`swatch ${color === c.name ? "is-active" : ""}`} title={c.name}>
                  <input
                    type="radio"
                    name="color"
                    value={c.name}
                    checked={color === c.name}
                    onChange={() => {
                      setColor(c.name);
                      setError("");
                      setAdded(false);
                    }}
                    className="sr-only"
                  />
                  <span className="swatch__dot" style={{ background: c.hex }} aria-hidden="true" />
                  <span className="sr-only">{c.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {sizes.length > 0 && (
          <fieldset className="pdm__field">
            <legend>
              Size: <strong>{size ?? "Select a size"}</strong>
            </legend>
            <div className="pdm__sizes">
              {sizes.map((s) => (
                <label key={s} className={`size-opt ${size === s ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    onChange={() => {
                      setSize(s);
                      setError("");
                      setAdded(false);
                    }}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
            <p className="pdm__hint">Not sure of your size? Ask us on WhatsApp.</p>
          </fieldset>
        )}

        <div className="pdm__actions">
          <QuantityStepper
            value={qty}
            onChange={(n) => {
              setQty(Math.min(maxQty, Math.max(1, n)));
              setAdded(false);
            }}
            max={maxQty}
          />
          {added ? (
            <button type="button" className="btn btn--primary pdm__add" onClick={viewBag} data-autofocus>
              <Check size={17} strokeWidth={1.6} /> Added — View bag
            </button>
          ) : (
            <button type="button" className="btn btn--primary pdm__add" onClick={handleAdd} disabled={soldOut}>
              {soldOut ? "Sold out" : "Add to bag"}
            </button>
          )}
        </div>
        <p className="pdm__error" role="alert">
          {error}
        </p>
        {added && (
          <button type="button" className="pdm__continue" onClick={onClose}>
            Continue shopping
          </button>
        )}

        <a className="pdm__ask" href={productEnquiryUrl(product, settings)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={17} /> Questions about this piece? Ask us on WhatsApp
        </a>
      </div>
    </div>
  );
}
