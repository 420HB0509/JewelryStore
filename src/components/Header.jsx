import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { NAV_LINKS, STORE_CONFIG } from "../config/store.js";
import { useCart } from "../context/CartContext.jsx";
import { useDialog } from "../hooks/useDialog.js";
import { generalEnquiryUrl } from "../utils/whatsapp.js";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons.jsx";
import Wordmark from "./Wordmark.jsx";
import "./Header.css";

export default function Header({ menuOpen, setMenuOpen }) {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useDialog(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header__inner container">
          <div className="header__left">
            <button
              className="icon-btn header__burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={22} strokeWidth={1.4} />
            </button>
            <nav className="header__nav" aria-label="Main">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="header__link">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          <a href="#top" className="header__brand" aria-label={`${STORE_CONFIG.name} — home`}>
            <Wordmark />
          </a>

          <div className="header__right">
            <a
              className="icon-btn header__social"
              href={STORE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (opens in a new tab)"
            >
              <InstagramIcon size={19} />
            </a>
            <button
              className="icon-btn header__cart"
              onClick={openCart}
              aria-label={`Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={21} strokeWidth={1.4} />
              {count > 0 && (
                <span key={count} className="header__count" aria-hidden="true">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`mmenu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mmenu__backdrop" onClick={() => setMenuOpen(false)} />
        <div
          id="mobile-menu"
          className="mmenu__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          ref={menuRef}
          tabIndex={-1}
        >
          <div className="mmenu__top">
            <Wordmark />
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} strokeWidth={1.4} />
            </button>
          </div>
          <nav className="mmenu__nav" aria-label="Mobile">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                className="mmenu__link"
                style={{ transitionDelay: menuOpen ? `${120 + i * 50}ms` : "0ms" }}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mmenu__foot">
            <a className="btn btn--wa btn--block" href={generalEnquiryUrl()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} /> Chat on WhatsApp
            </a>
            <a className="mmenu__ig" href={STORE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={18} /> {STORE_CONFIG.instagramHandle}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
