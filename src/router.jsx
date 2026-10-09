/* A tiny client-side router (no dependency).
   - <Link to="/collections/rings"> changes page without reloading
   - "/#about" goes to the home page, then scrolls to the section
   - Back/forward restore the previous scroll position
   Vercel serves index.html for these paths (see vercel.json). */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const RouterContext = createContext(null);

const currentLocation = () => ({
  path: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

const scrollToHash = (hash, smooth) => {
  const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  return Boolean(el);
};

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(currentLocation);
  const pendingScroll = useRef(null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const onPop = (e) => {
      pendingScroll.current = { y: e.state?.scrollY ?? 0 };
      setLocation(currentLocation());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Scroll once the new page has rendered
  useEffect(() => {
    const p = pendingScroll.current;
    if (!p) return;
    pendingScroll.current = null;
    requestAnimationFrame(() => {
      if (p.hash && scrollToHash(p.hash, p.smooth)) return;
      window.scrollTo({ top: p.y ?? 0, behavior: "instant" });
    });
  }, [location]);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const url = new URL(to, window.location.href);
    if (url.origin !== window.location.origin) {
      window.location.href = url.href;
      return;
    }
    const samePage = url.pathname === window.location.pathname;
    // Remember where we were, for the back button
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, "");
    const target = url.pathname + url.search + url.hash;
    if (replace) window.history.replaceState({ scrollY: window.scrollY }, "", target);
    else window.history.pushState({ scrollY: 0 }, "", target);

    if (!replace) pendingScroll.current = url.hash ? { hash: url.hash, smooth: samePage } : samePage ? null : { y: 0 };
    setLocation({ path: url.pathname, search: url.search, hash: url.hash });
  }, []);

  /** Updates query parameters (e.g. sort/filter) without adding history entries. */
  const setParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      navigate(`${window.location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
    },
    [navigate]
  );

  const value = useMemo(
    () => ({ ...location, params: new URLSearchParams(location.search), navigate, setParams }),
    [location, navigate, setParams]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside <RouterProvider>");
  return ctx;
}

/** <a> that navigates in-app. Ctrl/Cmd-click and new-tab links behave normally. */
export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter();
  const handleClick = (e) => {
    onClick?.(e);
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      rest.target === "_blank"
    )
      return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

/** Sets the browser tab title for the current page. */
export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
