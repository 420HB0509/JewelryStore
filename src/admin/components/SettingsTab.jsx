import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Plus, Upload, X } from "lucide-react";
import { LIMITS, normalizeCatalog } from "../../../shared/catalog.js";
import { formatPrice } from "../../utils/format.js";
import { buildWhatsAppUrl, displayNumber } from "../../utils/whatsapp.js";
import { ConfirmDialog, Field, MoneyInput, Switch, useToast } from "./ui.jsx";

const SAMPLE_NUMBER = "212600000000";
const str = (n) => (n === null || n === undefined ? "" : String(n));
const num = (s) => (String(s).trim() === "" ? null : Number(s));

function toDraft(settings) {
  return {
    whatsappNumber: settings.whatsappNumber,
    instagramUrl: settings.instagramUrl,
    instagramHandle: settings.instagramHandle,
    feeMode: settings.deliveryFee === null ? "whatsapp" : "fixed",
    deliveryFee: str(settings.deliveryFee),
    freeEnabled: settings.freeDeliveryThreshold !== null,
    freeDeliveryThreshold: str(settings.freeDeliveryThreshold ?? 500),
    deliveryMode: settings.deliveryMode,
    announcements: settings.announcements.length ? settings.announcements : [""],
  };
}

function validate(d) {
  const errors = {};
  const digits = d.whatsappNumber.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) errors.whatsappNumber = "Enter the full number with country code, e.g. 212612345678.";
  else if (digits.startsWith("0")) errors.whatsappNumber = "Start with the country code instead of 0 (Morocco: 212…).";
  if (d.feeMode === "fixed" && !(num(d.deliveryFee) >= 0)) errors.deliveryFee = "Enter a delivery fee (0 or more).";
  if (d.freeEnabled && !(num(d.freeDeliveryThreshold) > 0)) errors.freeDeliveryThreshold = "Enter an amount above 0.";
  if (d.instagramUrl && !/^https:\/\//i.test(d.instagramUrl.trim())) errors.instagramUrl = "Paste the full link, starting with https://";
  return errors;
}

export default function SettingsTab({ catalog, commit, onDirtyChange }) {
  const toast = useToast();
  const [draft, setDraft] = useState(() => toDraft(catalog.settings));
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [restore, setRestore] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const discard = () => {
    setDraft(toDraft(catalog.settings));
    setErrors({});
    setDirty(false);
  };

  const save = async () => {
    const errs = validate(draft);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    const settings = {
      ...catalog.settings,
      whatsappNumber: draft.whatsappNumber.replace(/\D/g, ""),
      instagramUrl: draft.instagramUrl.trim(),
      instagramHandle: draft.instagramHandle.trim(),
      deliveryFee: draft.feeMode === "whatsapp" ? null : num(draft.deliveryFee),
      freeDeliveryThreshold: draft.freeEnabled ? num(draft.freeDeliveryThreshold) : null,
      deliveryMode: draft.deliveryMode,
      announcements: draft.announcements.map((a) => a.trim()).filter(Boolean),
    };
    setSaving(true);
    const ok = await commit((cat) => ({ ...cat, settings }), "Settings saved");
    setSaving(false);
    if (ok) setDirty(false);
  };

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `store-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const pickBackup = async (file) => {
    try {
      const { catalog: restored, errors: problems } = normalizeCatalog(JSON.parse(await file.text()));
      if (!restored.products.length && !restored.collections.length) throw new Error("empty");
      if (problems.length) {
        toast(`This backup has a problem: ${problems[0]}`, "error", 7000);
        return;
      }
      setRestore(restored);
    } catch {
      toast("That file isn't a valid store backup.", "error");
    }
  };

  const digits = draft.whatsappNumber.replace(/\D/g, "");
  const threshold = num(draft.freeDeliveryThreshold);

  return (
    <section className="tab tab--settings">
      <div className="tab__head">
        <div>
          <h1>Delivery &amp; settings</h1>
          <p className="tab__sub">How customers reach you and what delivery costs.</p>
        </div>
      </div>

      <div className="settings">
        <section className="editor__card">
          <h3>WhatsApp</h3>
          <Field
            label="WhatsApp number for orders"
            htmlFor="st-wa"
            error={errors.whatsappNumber}
            hint="Country code + number, without + or spaces. Example for 06 12 34 56 78 in Morocco: 212612345678"
          >
            <input
              id="st-wa"
              className="ainput"
              inputMode="tel"
              value={draft.whatsappNumber}
              onChange={(e) => set({ whatsappNumber: e.target.value })}
            />
          </Field>
          {digits === SAMPLE_NUMBER && (
            <p className="warn-note">This is still the sample number — orders won't reach you until you change it.</p>
          )}
          {digits.length >= 8 && !errors.whatsappNumber && (
            <a
              className="alink"
              href={buildWhatsAppUrl({ whatsappNumber: digits }, "Test message from my store's control center")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> Send a test message to {displayNumber(digits)}
            </a>
          )}
        </section>

        <section className="editor__card">
          <h3>Delivery</h3>
          <Field label="Standard delivery fee">
            <div className="radios" role="radiogroup" aria-label="Standard delivery fee">
              <label className={`radio ${draft.feeMode === "whatsapp" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="st-fee"
                  checked={draft.feeMode === "whatsapp"}
                  onChange={() => set({ feeMode: "whatsapp" })}
                />
                <span>
                  <strong>Confirm on WhatsApp</strong>
                  <small>Fee depends on the city — you tell the customer in the chat.</small>
                </span>
              </label>
              <label className={`radio ${draft.feeMode === "fixed" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="st-fee"
                  checked={draft.feeMode === "fixed"}
                  onChange={() => set({ feeMode: "fixed" })}
                />
                <span>
                  <strong>Fixed fee</strong>
                  <small>Added automatically to the order total.</small>
                </span>
              </label>
            </div>
          </Field>
          {draft.feeMode === "fixed" && (
            <Field label="Delivery fee" htmlFor="st-fee-amount" error={errors.deliveryFee}>
              <MoneyInput
                id="st-fee-amount"
                value={draft.deliveryFee}
                onChange={(v) => set({ deliveryFee: v })}
              />
            </Field>
          )}

          <div className="settings__free">
            <Switch
              checked={draft.freeEnabled}
              onChange={(v) => set({ freeEnabled: v })}
              label="Free delivery above an amount"
              showLabel
            />
            {draft.freeEnabled && (
              <Field label="Free delivery from" htmlFor="st-free" error={errors.freeDeliveryThreshold}>
                <MoneyInput
                  id="st-free"
                  value={draft.freeDeliveryThreshold}
                  onChange={(v) => set({ freeDeliveryThreshold: v })}
                />
              </Field>
            )}
          </div>

          <Field
            label="When products have their own delivery fee"
            hint="You can give a product its own fee (or free delivery) in its editor."
          >
            <div className="radios" role="radiogroup" aria-label="How product delivery fees combine">
              <label className={`radio ${draft.deliveryMode === "highest" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="st-mode"
                  checked={draft.deliveryMode === "highest"}
                  onChange={() => set({ deliveryMode: "highest" })}
                />
                <span>
                  <strong>Charge once per order</strong>
                  <small>The highest fee in the bag. Example: items at 30 and 45 MAD → delivery 45 MAD.</small>
                </span>
              </label>
              <label className={`radio ${draft.deliveryMode === "per_item" ? "is-active" : ""}`}>
                <input
                  type="radio"
                  name="st-mode"
                  checked={draft.deliveryMode === "per_item"}
                  onChange={() => set({ deliveryMode: "per_item" })}
                />
                <span>
                  <strong>Charge for every item</strong>
                  <small>Each item's fee × quantity. Example: 2 items at 30 MAD → delivery 60 MAD.</small>
                </span>
              </label>
            </div>
          </Field>
          {draft.freeEnabled && threshold > 0 && (
            <p className="field__hint">Orders from {formatPrice(threshold)} always get free delivery.</p>
          )}
        </section>

        <section className="editor__card">
          <h3>Announcement bar</h3>
          <p className="field__hint">
            Short messages that rotate at the top of the store. Write <code>{"{threshold}"}</code> to show your
            free-delivery amount.
          </p>
          <div className="announce">
            {draft.announcements.map((a, i) => (
              <div key={i} className="announce__row">
                <input
                  className="ainput"
                  value={a}
                  maxLength={120}
                  onChange={(e) =>
                    set({ announcements: draft.announcements.map((x, j) => (j === i ? e.target.value : x)) })
                  }
                  aria-label={`Message ${i + 1}`}
                  placeholder="e.g. New collection available"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => set({ announcements: draft.announcements.filter((_, j) => j !== i) })}
                  aria-label={`Remove message ${i + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {draft.announcements.length < LIMITS.announcements && (
              <button
                type="button"
                className="alink"
                onClick={() => set({ announcements: [...draft.announcements, ""] })}
              >
                <Plus size={14} /> Add a message
              </button>
            )}
          </div>
        </section>

        <section className="editor__card">
          <h3>Instagram</h3>
          <div className="editor__row">
            <Field label="Profile link" htmlFor="st-ig" error={errors.instagramUrl} optional>
              <input
                id="st-ig"
                className="ainput"
                inputMode="url"
                value={draft.instagramUrl}
                onChange={(e) => set({ instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourbrand"
              />
            </Field>
            <Field label="Handle" htmlFor="st-igh" optional>
              <input
                id="st-igh"
                className="ainput"
                value={draft.instagramHandle}
                onChange={(e) => set({ instagramHandle: e.target.value })}
                placeholder="@yourbrand"
              />
            </Field>
          </div>
        </section>

        <section className="editor__card">
          <h3>Backup</h3>
          <p className="field__hint">
            Download a copy of all products, collections and settings. Keep it somewhere safe — you can restore it
            any time.
          </p>
          <div className="backup">
            <button type="button" className="abtn abtn--ghost" onClick={downloadBackup}>
              <Download size={16} /> Download backup
            </button>
            <button type="button" className="abtn abtn--ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Restore a backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                if (e.target.files[0]) pickBackup(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
        </section>
      </div>

      {dirty && (
        <div className="savebar" role="region" aria-label="Unsaved changes">
          <p>You have unsaved changes</p>
          <div>
            <button type="button" className="abtn abtn--ghost" onClick={discard}>
              Discard
            </button>
            <button type="button" className="abtn abtn--primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(restore)}
        title="Restore this backup?"
        confirmLabel="Replace everything"
        onCancel={() => setRestore(null)}
        onConfirm={async () => {
          const restored = restore;
          setRestore(null);
          const ok = await commit((cat) => ({ ...restored, updatedAt: cat.updatedAt }), "Backup restored");
          if (ok) {
            setDraft(toDraft(restored.settings));
            setDirty(false);
          }
        }}
      >
        <p>
          Your current store will be replaced with this backup ({restore?.products.length} products,{" "}
          {restore?.collections.length} collections).
        </p>
        <p className="field__hint">Tip: download a backup of the current version first.</p>
      </ConfirmDialog>
    </section>
  );
}
