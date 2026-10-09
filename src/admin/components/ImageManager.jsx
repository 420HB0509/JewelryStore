import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, Trash2 } from "lucide-react";
import { safeUrl } from "../../../shared/catalog.js";
import { imgSrc } from "../../utils/image.js";
import { api } from "../api.js";
import { compressImage } from "../imageTools.js";
import { useToast } from "./ui.jsx";

/**
 * Photo grid with upload, reorder, remove and "add by link".
 * The first photo is the main one shown in the shop.
 */
export default function ImageManager({ images, onChange, max = 8, uploadsMode, label = "photo" }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState("");
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const canUpload = uploadsMode !== "none";
  const room = max - images.length;

  const addUrls = (urls) => onChange([...imagesRef.current, ...urls].slice(0, max));

  const handleFiles = async (fileList) => {
    const files = [...fileList].slice(0, room);
    if (fileList.length > room) toast(`Only ${max} ${label}s allowed — extra files were skipped.`, "error");
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const blob = await compressImage(file);
        const { url } = await api.upload(blob, file.name);
        addUrls([url]);
      } catch (err) {
        toast(err.message || "Upload failed.", "error", 6000);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const move = (from, to) => {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const addLink = () => {
    const url = safeUrl(link);
    if (!url || !/^https:\/\//i.test(url)) {
      toast("Paste a full image link starting with https://", "error");
      return;
    }
    addUrls([url]);
    setLink("");
    setShowLink(false);
  };

  return (
    <div className="images">
      <div className="images__grid">
        {images.map((src, i) => (
          <figure key={`${src}-${i}`} className="images__item">
            <img src={imgSrc(src, 300)} alt="" loading="lazy" />
            {i === 0 && max > 1 && (
              <span className="images__main">
                <Star size={11} fill="currentColor" /> Main
              </span>
            )}
            <div className="images__actions">
              {max > 1 && (
                <>
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move left">
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === images.length - 1}
                    aria-label="Move right"
                  >
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
              <button
                type="button"
                className="images__remove"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                aria-label={`Remove ${label} ${i + 1}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </figure>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="images__item images__item--loading" aria-label="Uploading">
            <Loader2 size={22} className="spin" />
            <span>Uploading…</span>
          </div>
        ))}

        {room - uploading > 0 && canUpload && (
          <button type="button" className="images__add" onClick={() => inputRef.current?.click()}>
            <ImagePlus size={24} strokeWidth={1.4} />
            <span>{max > 1 ? (images.length ? `Add ${label}s` : `Upload ${label}s`) : `Upload a ${label}`}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {!canUpload && (
        <p className="field__hint">
          Photo upload isn't connected yet (see “Finish setup” above). You can paste image links in the meantime.
        </p>
      )}

      {room > 0 &&
        (showLink || !canUpload ? (
          <div className="images__link">
            <input
              type="url"
              inputMode="url"
              placeholder="https://… image link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              aria-label="Image link"
            />
            <button type="button" className="abtn abtn--ghost" onClick={addLink}>
              Add
            </button>
          </div>
        ) : (
          <button type="button" className="alink" onClick={() => setShowLink(true)}>
            <Link2 size={14} /> Or add a {label} from a link
          </button>
        ))}
    </div>
  );
}
