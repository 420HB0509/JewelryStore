import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImageOff, Info, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { isAvailable, productsInCollection, uniqueCollectionId } from "../../../shared/catalog.js";
import { imgSrc } from "../../utils/image.js";
import ImageManager from "./ImageManager.jsx";
import { ConfirmDialog, Field, Modal, Pill, Switch } from "./ui.jsx";

/** Why a collection is or isn't on the store, in plain words. */
function collectionStatus(collection, products) {
  const inCollection = productsInCollection(collection, products);
  const available = inCollection.filter(isAvailable).length;
  if (!collection.active) {
    return {
      tone: "muted",
      label: collection.kind === "category" ? "Turned off — its products are hidden" : "Turned off",
      available,
      total: inCollection.length,
    };
  }
  if (!available) {
    return {
      tone: "warn",
      label: "Hidden — no available products",
      available,
      total: inCollection.length,
    };
  }
  return { tone: "ok", label: "Shown on store", available, total: inCollection.length };
}

export default function CollectionsTab({ catalog, commit, uploadsMode }) {
  const [editing, setEditing] = useState(null); // collection object or "new"
  const [toDelete, setToDelete] = useState(null);
  const [moveTo, setMoveTo] = useState("");

  const { collections, products } = catalog;

  const update = (id, patch, message) =>
    commit((cat) => {
      cat.collections = cat.collections.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return cat;
    }, message);

  const move = (index, delta) =>
    commit((cat) => {
      const [item] = cat.collections.splice(index, 1);
      cat.collections.splice(index + delta, 0, item);
      return cat;
    });

  const deleteTarget = toDelete && products.filter((p) => p.category === toDelete.id);
  const otherCategories = collections.filter((c) => c.kind === "category" && c.id !== toDelete?.id);

  const confirmDelete = async () => {
    const target = toDelete;
    const destination = moveTo;
    setToDelete(null);
    await commit((cat) => {
      cat.products = cat.products.map((p) => (p.category === target.id ? { ...p, category: destination } : p));
      cat.collections = cat.collections.filter((c) => c.id !== target.id);
      return cat;
    }, `“${target.name}” deleted`);
  };

  return (
    <section className="tab">
      <div className="tab__head">
        <div>
          <h1>Collections</h1>
          <p className="tab__sub">The order here is the order on your store.</p>
        </div>
        <button type="button" className="abtn abtn--primary" onClick={() => setEditing("new")}>
          <Plus size={18} /> Add collection
        </button>
      </div>

      <div className="callout">
        <Info size={18} />
        <p>
          A collection appears on your store only when it's <strong>turned on</strong> and has{" "}
          <strong>at least one product that is visible and in stock</strong>. Empty or sold-out collections hide
          automatically and come back as soon as a product is available. Turning a collection{" "}
          <strong>off</strong> also hides all of its products.
        </p>
      </div>

      <ul className="clist">
        {collections.map((c, i) => {
          const status = collectionStatus(c, products);
          const cover = c.image || productsInCollection(c, products)[0]?.images[0];
          return (
            <li key={c.id} className={`crow ${c.active ? "" : "is-hidden"}`}>
              <div className="crow__order">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.name} up`}>
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === collections.length - 1}
                  aria-label={`Move ${c.name} down`}
                >
                  <ArrowDown size={15} />
                </button>
              </div>
              <button type="button" className="crow__thumb" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                {cover ? <img src={imgSrc(cover, 200)} alt="" loading="lazy" /> : <ImageOff size={20} />}
              </button>
              <div className="crow__info">
                <button type="button" className="prow__name" onClick={() => setEditing(c)}>
                  {c.name}
                  {c.kind === "bestsellers" && (
                    <span className="crow__auto">
                      <Sparkles size={12} /> Automatic
                    </span>
                  )}
                </button>
                <p className="prow__meta">
                  {status.total} {status.total === 1 ? "product" : "products"} · {status.available} available
                </p>
                <Pill tone={status.tone}>{status.label}</Pill>
                {status.tone === "ok" && (
                  <a className="alink crow__view" href={`/collections/${encodeURIComponent(c.id)}`} target="_blank" rel="noopener">
                    <ExternalLink size={13} /> View page
                  </a>
                )}
              </div>
              <div className="crow__controls">
                <div className="prow__visible">
                  <Switch
                    checked={c.active}
                    label={`Turn ${c.name} on or off`}
                    onChange={(v) =>
                      update(
                        c.id,
                        { active: v },
                        v
                          ? `${c.name} turned on`
                          : c.kind === "category"
                            ? `${c.name} turned off — its products are hidden from the store`
                            : `${c.name} turned off`
                      )
                    }
                  />
                  <span className="prow__visible-label">{c.active ? "On" : "Off"}</span>
                </div>
                <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => setEditing(c)}>
                  <Pencil size={15} /> Edit
                </button>
                {c.kind === "category" && (
                  <button
                    type="button"
                    className="icon-btn crow__delete"
                    onClick={() => {
                      setMoveTo(otherCategoriesFor(collections, c)[0]?.id || "");
                      setToDelete(c);
                    }}
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <CollectionEditor
          collection={editing === "new" ? null : editing}
          catalog={catalog}
          commit={commit}
          uploadsMode={uploadsMode}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete “${toDelete?.name}”?`}
        confirmLabel="Delete collection"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        disabled={Boolean(deleteTarget?.length) && !moveTo}
      >
        {deleteTarget?.length ? (
          otherCategories.length ? (
            <Field
              label={`Move its ${deleteTarget.length} ${deleteTarget.length === 1 ? "product" : "products"} to`}
              htmlFor="move-to"
            >
              <select id="move-to" className="ainput" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                {otherCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <p>Create another collection first, so its products have somewhere to go.</p>
          )
        ) : (
          <p>This collection has no products. It will be removed from your store.</p>
        )}
      </ConfirmDialog>
    </section>
  );
}

const otherCategoriesFor = (collections, c) => collections.filter((x) => x.kind === "category" && x.id !== c.id);

function CollectionEditor({ collection, catalog, commit, uploadsMode, onClose }) {
  const isNew = !collection;
  const [name, setName] = useState(collection?.name || "");
  const [description, setDescription] = useState(collection?.description || "");
  const [images, setImages] = useState(collection?.image ? [collection.image] : []);
  const [alt, setAlt] = useState(collection?.alt || "");
  const [active, setActive] = useState(collection?.active ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      setError("Give the collection a name.");
      return;
    }
    const data = { name: name.trim(), description: description.trim(), image: images[0] || "", alt: alt.trim(), active };
    setSaving(true);
    const ok = await commit((cat) => {
      if (isNew) {
        cat.collections.push({ id: uniqueCollectionId(cat.collections, data.name), kind: "category", ...data });
      } else {
        cat.collections = cat.collections.map((c) => (c.id === collection.id ? { ...c, ...data } : c));
      }
      return cat;
    }, isNew ? `Collection “${data.name}” created` : `Collection “${data.name}” saved`);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "New collection" : "Edit collection"}
      subtitle={
        collection?.kind === "bestsellers"
          ? "Automatic: lists every product labelled “Best seller”."
          : isNew
            ? "After creating it, choose this collection in your products."
            : undefined
      }
      footer={
        <>
          <button type="button" className="abtn abtn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="abtn abtn--primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create collection" : "Save changes"}
          </button>
        </>
      }
    >
      <div className="editor">
        <section className="editor__card">
          <Field label="Name" htmlFor="ce-name" error={error}>
            <input
              id="ce-name"
              className="ainput"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Anklets"
              maxLength={60}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="ce-desc"
            optional
            hint="One or two sentences shown at the top of the collection page."
          >
            <textarea
              id="ce-desc"
              className="ainput"
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Delicate chains to wear at the ankle all summer long."
            />
          </Field>
          <Switch checked={active} onChange={setActive} label="Turned on" showLabel />
        </section>
        <section className="editor__card">
          <h3>Cover photo</h3>
          <Field hint="Optional — without one, the first product's photo is used.">
            <ImageManager images={images} onChange={setImages} max={1} uploadsMode={uploadsMode} />
          </Field>
          {images.length > 0 && (
            <Field
              label="Photo description"
              htmlFor="ce-alt"
              optional
              hint="Read aloud to visually impaired visitors, e.g. “Gold hoops on a pink dish”."
            >
              <input id="ce-alt" className="ainput" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={160} />
            </Field>
          )}
        </section>
      </div>
    </Modal>
  );
}
