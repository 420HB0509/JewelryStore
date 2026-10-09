import { useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "../config/store.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { generalEnquiryUrl } from "../utils/whatsapp.js";
import { WhatsAppIcon } from "./BrandIcons.jsx";
import "./FAQ.css";

export default function FAQ() {
  const { settings } = useCatalog();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__intro reveal">
          <span className="eyebrow">Delivery &amp; FAQ</span>
          <h2 id="faq-title" className="section-title">
            Good to <em>know</em>
          </h2>
          <p className="section-lead">
            Can't find your answer? We reply personally on WhatsApp.
          </p>
          <a className="btn btn--wa faq__cta" href={generalEnquiryUrl(settings)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={18} /> Ask a question
          </a>
        </div>

        <div className="faq__list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq__item ${isOpen ? "is-open" : ""}`}>
                <h3>
                  <button
                    type="button"
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    {item.q}
                    <Plus className="faq__icon" size={18} strokeWidth={1.3} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq__a">
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
