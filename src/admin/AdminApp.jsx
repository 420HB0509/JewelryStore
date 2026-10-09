import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Gem, Layers, Loader2, LogOut, Settings2 } from "lucide-react";
import { normalizeCatalog } from "../../shared/catalog.js";
import { DEFAULT_CATALOG } from "../catalog/defaultCatalog.js";
import Wordmark from "../components/Wordmark.jsx";
import { api, getToken, setToken } from "./api.js";
import CollectionsTab from "./components/CollectionsTab.jsx";
import Login from "./components/Login.jsx";
import ProductEditor from "./components/ProductEditor.jsx";
import ProductsTab from "./components/ProductsTab.jsx";
import SettingsTab from "./components/SettingsTab.jsx";
import SetupNotice from "./components/SetupNotice.jsx";
import { ConfirmDialog, ToastProvider, useToast } from "./components/ui.jsx";

const TABS = [
  { id: "products", label: "Products", icon: Gem },
  { id: "collections", label: "Collections", icon: Layers },
  { id: "settings", label: "Delivery & settings", icon: Settings2 },
];

export default function AdminApp() {
  return (
    <ToastProvider>
      <ControlCenter />
    </ToastProvider>
  );
}

function ControlCenter() {
  const toast = useToast();
  const [token, setTokenState] = useState(getToken);
  const [loginNotice, setLoginNotice] = useState("");
  const [storage, setStorage] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [published, setPublished] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState(() => (TABS.some((t) => `#${t.id}` === window.location.hash) ? window.location.hash.slice(1) : "products"));
  const [editing, setEditing] = useState(null); // product, "new" or null
  const [pending, setPending] = useState(0);
  const [conflict, setConflict] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);

  // Last version confirmed by the server; saves run one at a time on top of it
  const savedRef = useRef(null);
  const queue = useRef(Promise.resolve());

  const logout = useCallback((notice = "") => {
    setToken("");
    setTokenState("");
    setCatalog(null);
    setLoginNotice(notice);
  }, []);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [session, data] = await Promise.all([api.session(), api.loadCatalog()]);
      const loaded = data.catalog ? normalizeCatalog(data.catalog).catalog : structuredClone(DEFAULT_CATALOG);
      savedRef.current = loaded;
      setStorage(session.storage);
      setPublished(Boolean(data.catalog));
      setCatalog(loaded);
      setConflict(false);
    } catch (err) {
      if (err.status === 401) logout("Your session has ended. Please log in again.");
      else setLoadError(err.message);
    }
  }, [logout]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  useEffect(() => {
    window.history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  // Warn before closing the page with unsaved work
  useEffect(() => {
    const busy = pending > 0 || settingsDirty || editing;
    if (!busy) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pending, settingsDirty, editing]);

  /**
   * Applies a change and saves it. The screen updates immediately and
   * rolls back if the save fails. Resolves to true when saved.
   */
  const commit = useCallback(
    (mutate, successMessage) => {
      const run = async () => {
        const base = savedRef.current;
        const next = mutate(structuredClone(base));
        if (!next) return false;
        setCatalog(next);
        setPending((n) => n + 1);
        try {
          const { catalog: saved } = await api.saveCatalog(next, base.updatedAt);
          savedRef.current = saved;
          setCatalog(saved);
          setPublished(true);
          if (successMessage) toast(successMessage);
          return true;
        } catch (err) {
          setCatalog(savedRef.current);
          if (err.status === 401) logout("Your session has ended. Please log in again.");
          else if (err.code === "CONFLICT") setConflict(true);
          else toast(err.message, "error", 7000);
          return false;
        } finally {
          setPending((n) => n - 1);
        }
      };
      const result = queue.current.then(run, run);
      queue.current = result.catch(() => {});
      return result;
    },
    [logout, toast]
  );

  if (!token) return <Login onLoggedIn={setTokenState} notice={loginNotice} />;

  if (!catalog) {
    return (
      <div className="boot">
        {loadError ? (
          <>
            <p>{loadError}</p>
            <button type="button" className="abtn abtn--primary" onClick={load}>
              Try again
            </button>
            <button type="button" className="alink" onClick={() => logout()}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Loader2 className="spin" size={26} />
            <p>Loading your store…</p>
          </>
        )}
      </div>
    );
  }

  const canSave = storage.catalog !== "none";

  return (
    <div className="admin">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__brand">
            <Wordmark />
            <span>Control Center</span>
          </div>
          <div className="topbar__status" aria-live="polite">
            {pending > 0 ? (
              <>
                <Loader2 size={14} className="spin" /> Saving…
              </>
            ) : published ? (
              <>
                <Check size={14} /> All changes saved
              </>
            ) : (
              "Sample catalog — not published"
            )}
          </div>
          <div className="topbar__actions">
            <a className="abtn abtn--ghost abtn--sm" href="../" target="_blank" rel="noopener">
              <ExternalLink size={15} /> <span className="hide-sm">View store</span>
            </a>
            <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => logout()} aria-label="Log out">
              <LogOut size={15} /> <span className="hide-sm">Log out</span>
            </button>
          </div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tabs__btn ${tab === t.id ? "is-active" : ""}`}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={16} strokeWidth={1.6} />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="admin__main">
        <SetupNotice storage={storage} />

        {!published && canSave && (
          <div className="callout callout--gold">
            <p>
              Your store is showing the <strong>sample catalog</strong>. Edit anything and save to publish your own —
              or publish the sample as it is and edit from there.
            </p>
            <button
              type="button"
              className="abtn abtn--primary abtn--sm"
              onClick={() => commit((cat) => cat, "Catalog published — your store now uses it.")}
            >
              Publish now
            </button>
          </div>
        )}

        {tab === "products" && (
          <ProductsTab
            catalog={catalog}
            commit={commit}
            onEdit={(p) => setEditing(p)}
            onAdd={() => setEditing("new")}
          />
        )}
        {tab === "collections" && <CollectionsTab catalog={catalog} commit={commit} uploadsMode={storage.uploads} />}
        {tab === "settings" && (
          <SettingsTab
            key={catalog.updatedAt || "sample"}
            catalog={catalog}
            commit={commit}
            onDirtyChange={setSettingsDirty}
          />
        )}
      </main>

      {editing && (
        <ProductEditor
          product={editing === "new" ? null : editing}
          catalog={catalog}
          commit={commit}
          uploadsMode={storage.uploads}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={conflict}
        title="Changes were made elsewhere"
        confirmLabel="Reload"
        tone="primary"
        onConfirm={load}
        onCancel={() => setConflict(false)}
      >
        <p>
          The catalog was updated from another device or tab, so your last change wasn't saved (to avoid overwriting
          it). Reload to get the latest version, then try again.
        </p>
      </ConfirmDialog>
    </div>
  );
}
