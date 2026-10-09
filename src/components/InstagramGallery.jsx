import { GALLERY, STORE_CONFIG } from "../config/store.js";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import { InstagramIcon } from "./BrandIcons.jsx";
import "./InstagramGallery.css";

export default function InstagramGallery() {
  if (!GALLERY.length) return null;
  return (
    <section className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{STORE_CONFIG.instagramHandle}</span>
          <h2 id="gallery-title" className="section-title">
            Styled <em>by you</em>
          </h2>
          <p className="section-lead">Follow us on Instagram for new arrivals, styling ideas and behind the scenes.</p>
        </div>
      </div>
      <ul className="gallery__grid">
        {GALLERY.map((g, i) => (
          <li key={g.image} className="reveal" style={{ transitionDelay: `${(i % 6) * 60}ms` }}>
            <a
              href={STORE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gallery__item"
              aria-label={`${g.alt} — view on Instagram`}
            >
              <img
                src={imgSrc(g.image, 500)}
                srcSet={imgSrcSet(g.image, [300, 500, 700])}
                sizes="(min-width: 900px) 17vw, 33vw"
                alt={g.alt}
                width="500"
                height="500"
                loading="lazy"
                decoding="async"
              />
              <span className="gallery__overlay" aria-hidden="true">
                <InstagramIcon size={24} />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="gallery__cta">
        <a className="btn btn--outline" href={STORE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">
          <InstagramIcon size={17} /> Follow {STORE_CONFIG.instagramHandle}
        </a>
      </div>
    </section>
  );
}
