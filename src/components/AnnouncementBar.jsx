import { useEffect, useState } from "react";
import { ANNOUNCEMENTS, STORE_CONFIG } from "../config/store.js";
import { fill, formatPrice } from "../utils/format.js";
import "./AnnouncementBar.css";

const hasThreshold = typeof STORE_CONFIG.freeDeliveryThreshold === "number";

// Drop the free-delivery message automatically if no threshold is configured
const MESSAGES = ANNOUNCEMENTS.filter((m) => hasThreshold || !m.includes("{threshold}")).map((m) =>
  fill(m, { threshold: hasThreshold ? formatPrice(STORE_CONFIG.freeDeliveryThreshold) : "" })
);

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (MESSAGES.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  if (!MESSAGES.length) return null;

  return (
    <div className="announcement" role="region" aria-label="Store announcements">
      <div className="announcement__track">
        {MESSAGES.map((m, i) => (
          <p key={m} className={`announcement__msg ${i === index ? "is-active" : ""}`} aria-hidden={i !== index}>
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}
