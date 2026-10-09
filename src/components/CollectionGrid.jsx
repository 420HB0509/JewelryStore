import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { Link } from "../router.jsx";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import "./CollectionGrid.css";

export const collectionPath = (id) => `/collections/${encodeURIComponent(id)}`;

/**
 * Collection cards linking to each collection page.
 * Only collections that are turned on and have an available piece are shown.
 */
export default function CollectionGrid({
  id = "collections",
  eyebrow = "Shop by Collection",
  title = (
    <>
      Find your <em>signature</em> piece
    </>
  ),
  excludeId,
  compact = false,
}) {
  const { collections, productsIn } = useCatalog();
  const list = collections.filter((c) => c.id !== excludeId);
  if (!list.length) return null;

  return (
    <section
      id={id}
      className={`section collections ${compact ? "collections--compact" : ""}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{eyebrow}</span>
          <h2 id={`${id}-title`} className="section-title">
            {title}
          </h2>
        </div>

        <ul className="collections__grid">
          {list.map((c, i) => {
            const n = productsIn(c).length;
            const image = c.image || productsIn(c)[0]?.images[0];
            return (
              <li key={c.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <Link to={collectionPath(c.id)} className="collection-card">
                  <span className="collection-card__media">
                    {image && (
                      <img
                        src={imgSrc(image, 700)}
                        srcSet={imgSrcSet(image, [400, 700, 1000])}
                        sizes="(min-width: 900px) 30vw, 50vw"
                        alt={c.alt || c.name}
                        width="700"
                        height="875"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </span>
                  <span className="collection-card__label">
                    <span className="collection-card__name">{c.name}</span>
                    <span className="collection-card__meta">
                      {n} {n === 1 ? "piece" : "pieces"}
                      <ArrowUpRight size={16} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
