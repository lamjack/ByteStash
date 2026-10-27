import React, { useEffect, useId, useRef, useState } from "react";
import { X, Maximize2, Minimize2, Trash2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../buttons/IconButton";

const FOCUSABLE_SELECTOR =
  'input, textarea, select, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  fullHeight?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  contentRef?: React.Ref<HTMLDivElement>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-3xl",
  fullHeight = false,
  expandable = false,
  defaultExpanded = false,
  onEdit,
  onDelete,
  contentRef,
}) => {
  const { t } = useTranslation();
  const titleId = useId();

  const [isExpanded, setIsExpanded] = useState(() => {
    if (expandable) {
      const savedState = localStorage.getItem("modalExpandedState");
      return savedState !== null ? savedState === "true" : defaultExpanded;
    }
    return defaultExpanded;
  });

  useEffect(() => {
    if (expandable) {
      localStorage.setItem("modalExpandedState", isExpanded.toString());
    }
  }, [isExpanded, expandable]);

  const modalRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    restoreFocusRef.current = previousFocus;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    });

    const handleClickOutside = (event: MouseEvent) => {
      const isBackdropClick = (event.target as HTMLElement).classList.contains(
        "modal-backdrop"
      );
      if (isBackdropClick && modalRef.current?.parentElement === event.target) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = modalRef.current;
      if (!panel) return;
      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex >= 0);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      if (restoreFocusRef.current?.isConnected) {
        restoreFocusRef.current.focus();
      }
      restoreFocusRef.current = null;
    };
  }, [isOpen]);

  const modalWidth = isExpanded ? "max-w-[90vw]" : width;
  const modalHeight = fullHeight ? "h-[88vh] max-h-[88vh]" : "max-h-[80vh]";

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 opacity-100 transition-opacity duration-300"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-light-surface dark:bg-dark-surface rounded-lg w-full ${modalWidth} ${modalHeight} flex flex-col opacity-100 scale-100
          transition-all duration-300 ease-in-out transform`}
        style={{
          willChange: "transform, opacity, width",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div id={titleId} className="flex-1 text-lg font-semibold text-light-text dark:text-dark-text">
            {title}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <IconButton
                icon={<Pencil size={18} />}
                onClick={onEdit}
                variant="secondary"
                size="sm"
                label={t('action.edit')}
              />
            )}
            {onDelete && (
              <IconButton
                icon={<Trash2 size={18} />}
                onClick={onDelete}
                variant="secondary"
                size="sm"
                label={t('action.delete')}
              />
            )}
            <div className="h-6 w-px bg-light-border dark:bg-dark-border mx-2" />
            {expandable && (
              <IconButton
                icon={
                  isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />
                }
                onClick={() => setIsExpanded(!isExpanded)}
                variant="secondary"
                size="sm"
                label={isExpanded ? t('action.minimize') : t('action.maximize')}
              />
            )}
            <IconButton
              icon={<X size={20} />}
              onClick={onClose}
              variant="secondary"
              size="sm"
              label={t('action.close')}
            />
          </div>
        </div>

        {/* Single scrollable area connected to external ref */}
        <div ref={contentRef} className="flex-1 px-4 pb-4 mt-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
