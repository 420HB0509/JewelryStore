import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SHOW_TESTIMONIALS, TESTIMONIALS } from "../config/store.js";
import "./Testimonials.css";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 7000);
    return () => clearInterval(t);
  }, [paused, total]);

  if (!SHOW_TESTIMONIALS || !total) return null;

  const go = (d) => setIndex((i) => (i + d + total) % total);
  const anyPlaceholder = TESTIMONIALS.some((t) => t.isPlaceholder);

  return (
    <section
      className="section quotes"
      aria-labelledby="quotes-title"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container quotes__inner">
        <span className="eyebrow quotes__eyebrow">Kind Words</span>
        <h2 id="quotes-title" className="sr-only">
          Customer testimonials
        </h2>

        <div className="quotes__stage">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className={`quote ${i === index ? "is-active" : ""}`}
              aria-hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
            >
              {t.isPlaceholder && <span className="quote__tag">Placeholder review</span>}
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                {t.name}
                {t.detail && <span> · {t.detail}</span>}
              </figcaption>
            </figure>
          ))}
        </div>

        {total > 1 && (
          <div className="quotes__nav">
            <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous testimonial">
              <ChevronLeft size={20} strokeWidth={1.3} />
            </button>
            <div className="quotes__dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quotes__dot ${i === index ? "is-active" : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
            <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next testimonial">
              <ChevronRight size={20} strokeWidth={1.3} />
            </button>
          </div>
        )}

        {anyPlaceholder && (
          <p className="quotes__note">
            Sample layout — these are placeholders, not real customer reviews.
          </p>
        )}
      </div>
    </section>
  );
}
