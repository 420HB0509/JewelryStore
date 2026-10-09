import { Gem, MessageCircle, Tag } from "lucide-react";
import { BRAND_STORY, MATERIALS } from "../config/store.js";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import "./BrandStory.css";

const ICONS = { gem: Gem, tag: Tag, message: MessageCircle };

export default function BrandStory() {
  return (
    <section id="about" className="section story" aria-labelledby="story-title">
      <div className="container story__grid">
        <figure className="story__media reveal">
          <img
            src={imgSrc(BRAND_STORY.image, 900)}
            srcSet={imgSrcSet(BRAND_STORY.image, [500, 800, 1100, 1400])}
            sizes="(min-width: 900px) 45vw, 100vw"
            alt={BRAND_STORY.imageAlt}
            width="900"
            height="1125"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="story__copy">
          <div className="reveal">
            <span className="eyebrow">{BRAND_STORY.eyebrow}</span>
            <h2 id="story-title" className="section-title">
              {BRAND_STORY.headline}
            </h2>
            {BRAND_STORY.body.map((p) => (
              <p key={p.slice(0, 24)} className="story__p">
                {p}
              </p>
            ))}
          </div>

          <ul className="story__values">
            {BRAND_STORY.values.map((v, i) => {
              const Icon = ICONS[v.icon] ?? Gem;
              return (
                <li key={v.title} className="story__value reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="story__icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.3} />
                  </span>
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="story__materials reveal">
            <p className="story__materials-title">Our materials, honestly</p>
            <dl>
              {MATERIALS.map((m) => (
                <div key={m.name}>
                  <dt>{m.name}</dt>
                  <dd>{m.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
