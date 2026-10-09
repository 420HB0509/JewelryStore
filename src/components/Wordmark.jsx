import { STORE_CONFIG } from "../config/store.js";

/** Text wordmark, or the logo image when STORE_CONFIG.logoUrl is set. */
export default function Wordmark({ className = "" }) {
  if (STORE_CONFIG.logoUrl) {
    return <img className={`wordmark-img ${className}`} src={STORE_CONFIG.logoUrl} alt={STORE_CONFIG.name} />;
  }
  return <span className={`wordmark ${className}`}>{STORE_CONFIG.name}</span>;
}
