import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { fill, formatPrice } from "../utils/format.js";
import "./AnnouncementBar.css";

export default function AnnouncementBar() {
  const { settings } = useCatalog();
  const [index, setIndex] = useState(0);

  // Drop the free-delivery message automatically if no threshold is configured
  const messages = useMemo(() => {
    const threshold = settings.freeDeliveryThreshold;
    const hasThreshold = typeof threshold === "number";
    return settings.announcements
      .filter((m) => hasThreshold || !m.includes("{threshold}"))
      .map((m) => fill(m, { threshold: hasThreshold ? formatPrice(threshold) : "" }));
  }, [settings]);

  useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [messages.length]);

  if (!messages.length) return null;

  return (
    <div className="announcement" role="region" aria-label="Store announcements">
      <div className="announcement__track">
        {messages.map((m, i) => (
          <p
            key={m}
            className={`announcement__msg ${i === index % messages.length ? "is-active" : ""}`}
            aria-hidden={i !== index % messages.length}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}
