import { useEffect, useRef, type ReactNode } from "react";

interface ContextDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ContextDrawer({ title, open, onClose, children }: ContextDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previous = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    previous.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous.current instanceof HTMLElement) {
        previous.current.focus();
      }
    };
  }, [onClose, open]);

  return (
    <div className="drawer-root" hidden={!open}>
      <button type="button" className="drawer-backdrop" aria-label="Close details" onClick={onClose} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h2>{title}</h2>
          <button ref={closeRef} type="button" className="wb-btn" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
