import { useEffect, useRef } from "react";

let lockCount = 0;

/**
 * Shared behaviour for modal surfaces (drawers, dialogs, menus):
 * - locks page scroll while open
 * - closes on Escape
 * - moves focus inside, traps Tab, and restores focus on close
 */
export function useDialog(isOpen, onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;

    lockCount += 1;
    document.body.classList.add("no-scroll");

    const node = ref.current;
    const focusables = () =>
      node
        ? [...node.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
          )].filter((el) => el.offsetParent !== null)
        : [];

    const raf = requestAnimationFrame(() => {
      const target = node?.querySelector("[data-autofocus]") || focusables()[0] || node;
      target?.focus({ preventScroll: true });
    });

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.classList.remove("no-scroll");
      }
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return ref;
}
