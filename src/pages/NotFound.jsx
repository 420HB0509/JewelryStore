import { STORE_CONFIG } from "../config/store.js";
import { Link, usePageTitle } from "../router.jsx";

export default function NotFound({
  title = "Page not found",
  text = "The page you're looking for doesn't exist or has moved.",
}) {
  usePageTitle(`${title} — ${STORE_CONFIG.name}`);
  return (
    <section className="section notfound">
      <div className="container notfound__inner">
        <span className="eyebrow">Oops</span>
        <h1 className="section-title">{title}</h1>
        <p className="section-lead">{text}</p>
        <div className="notfound__actions">
          <Link to="/collections/all" className="btn btn--primary">
            Shop all jewelry
          </Link>
          <Link to="/" className="link-underline">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
