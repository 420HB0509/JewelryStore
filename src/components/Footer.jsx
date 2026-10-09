import { NAV_LINKS, STORE_CONFIG } from "../config/store.js";
import { generalEnquiryUrl } from "../utils/whatsapp.js";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons.jsx";
import Wordmark from "./Wordmark.jsx";
import "./Footer.css";

/** "212600000000" -> "+212 600 000 000" for display only */
const displayNumber = (n) => {
  const d = String(n).replace(/\D/g, "");
  return `+${d.slice(0, 3)} ${d.slice(3).replace(/(\d{3})(?=\d)/g, "$1 ")}`;
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Wordmark />
            <p>
              {STORE_CONFIG.tagline}. Gold-plated and gold-tone stainless steel fashion jewelry, ordered easily through
              WhatsApp.
            </p>
            <div className="footer__social">
              <a href={generalEnquiryUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={18} />
              </a>
              <a href={STORE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>

          <nav className="footer__col" aria-label="Footer">
            <h2>Explore</h2>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <h2>Help</h2>
            <ul>
              <li>
                <a href="#faq">How to order</a>
              </li>
              <li>
                <a href="#faq">Delivery</a>
              </li>
              <li>
                <a href="#faq">Exchanges &amp; returns</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>Contact</h2>
            <ul>
              <li>
                <a href={generalEnquiryUrl()} target="_blank" rel="noopener noreferrer">
                  WhatsApp {displayNumber(STORE_CONFIG.whatsappNumber)}
                </a>
              </li>
              <li>
                <a href={STORE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram {STORE_CONFIG.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            © {year} {STORE_CONFIG.name}. All rights reserved.
          </p>
          <p>Prices in {STORE_CONFIG.currency}. Fashion jewelry — not solid gold.</p>
        </div>
      </div>
    </footer>
  );
}
