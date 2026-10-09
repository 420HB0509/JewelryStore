import { ArrowUpRight } from "lucide-react";
import { COLLECTIONS } from "../config/store.js";
import { PRODUCTS } from "../data/products.js";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import "./CollectionGrid.css";

const countFor = (filter) =>
  filter === "bestseller"
    ? PRODUCTS.filter((p) => p.badge === "bestseller").length
    : PRODUCTS.filter((p) => p.category === filter).length;

export default function CollectionGrid({ onSelect }) {
  return (
    <section id="collections" className="section collections" aria-labelledby="collections-title">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Shop by Collection</span>
          <h2 id="collections-title" className="section-title">
            Find your <em>signature</em> piece
          </h2>
        </div>

        <ul className="collections__grid">
          {COLLECTIONS.map((c, i) => {
            const n = countFor(c.filter);
            return (
              <li key={c.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <button type="button" className="collection-card" onClick={() => onSelect(c.filter)}>
                  <span className="collection-card__media">
                    <img
                      src={imgSrc(c.image, 700)}
                      srcSet={imgSrcSet(c.image, [400, 700, 1000])}
                      sizes="(min-width: 900px) 30vw, 50vw"
                      alt={c.alt}
                      width="700"
                      height="875"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="collection-card__label">
                    <span className="collection-card__name">{c.name}</span>
                    <span className="collection-card__meta">
                      {n} {n === 1 ? "piece" : "pieces"}
                      <ArrowUpRight size={16} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
