import { useEffect, useRef } from "react";

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomDrawer({
  isOpen,
  onClose,
  children,
  title,
}: BottomDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="bg-background animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50 max-h-[90vh] overflow-hidden rounded-t-2xl shadow-2xl duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="bg-muted-foreground/30 h-1.5 w-12 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="border-border border-b px-6 py-3">
            <h2 className="text-foreground text-xl font-semibold">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
