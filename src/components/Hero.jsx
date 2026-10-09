import { ArrowRight } from "lucide-react";
import { HERO } from "../config/store.js";
import { Link } from "../router.jsx";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import "./Hero.css";

/** Italicises the last word of the headline for an editorial touch. */
function Headline({ text }) {
  const words = text.trim().split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <em>{last}</em>
    </>
  );
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <div className="hero__frame">
          <img
          className="hero__img"
          src={imgSrc(HERO.image, 1200)}
          srcSet={imgSrcSet(HERO.image, [600, 900, 1200, 1600, 2000])}
          sizes="(min-width: 900px) 58vw, 100vw"
          alt={HERO.imageAlt}
          width="1200"
          height="1500"
          fetchpriority="high"
          />
        </div>
        <figure className="hero__detail">
          <img
            src={imgSrc(HERO.detailImage, 500)}
            srcSet={imgSrcSet(HERO.detailImage, [300, 500, 700])}
            sizes="240px"
            alt={HERO.detailImageAlt}
            width="500"
            height="625"
            loading="lazy"
          />
        </figure>
      </div>

      <div className="hero__content">
        <div className="hero__copy">
          <span className="eyebrow hero__eyebrow">{HERO.eyebrow}</span>
          <h1 id="hero-title" className="hero__title">
            <Headline text={HERO.headline} />
          </h1>
          <p className="hero__sub">{HERO.subheadline}</p>
          <div className="hero__ctas">
            <Link to={HERO.primaryCta.href} className="btn hero__cta-primary">
              {HERO.primaryCta.label}
            </Link>
            <Link to={HERO.secondaryCta.href} className="link-underline hero__cta-secondary">
              {HERO.secondaryCta.label} <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
