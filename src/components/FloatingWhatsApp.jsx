import { generalEnquiryUrl } from "../utils/whatsapp.js";
import { WhatsAppIcon } from "./BrandIcons.jsx";
import "./FloatingWhatsApp.css";

/** Hidden while the cart, product sheet or menu is open so it never covers them. */
export default function FloatingWhatsApp({ hidden }) {
  return (
    <a
      className={`fab-wa ${hidden ? "is-hidden" : ""}`}
      href={generalEnquiryUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
    >
      <WhatsAppIcon size={27} />
      <span className="fab-wa__label">Chat with us</span>
    </a>
  );
}
