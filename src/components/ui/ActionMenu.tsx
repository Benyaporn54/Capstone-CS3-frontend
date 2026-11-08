"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export type ActionMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  /** ลิงก์ภายในเว็บ — ถ้ามีจะ render เป็น Link */
  href?: string;
  onSelect?: () => void;
  /** สีแดง สำหรับคำสั่งที่ลบ/เอาออก */
  danger?: boolean;
  /** ขีดเส้นคั่นก่อนรายการนี้ */
  separatorBefore?: boolean;
};

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** aria-label ของปุ่ม ⋯ */
  label: string;
  className?: string;
}

const MENU_WIDTH = 236;
const GAP = 4;

/**
 * ปุ่ม ⋯ + เมนูคำสั่ง (dropdown menu)
 * render เมนูผ่าน portal แบบ fixed เพื่อไม่ให้โดน overflow-hidden ของการ์ดตัด
 * ปิดด้วย Esc / คลิกข้างนอก / scroll, ใช้ ↑ ↓ Home End Enter ได้
 */
export function ActionMenu({ items, label, className = "" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const menuId = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // วางเมนูชิดขวาใต้ปุ่ม ถ้าที่ด้านล่างไม่พอให้เปิดขึ้นด้านบน
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < menuHeight + GAP + 8
        ? Math.max(8, rect.top - menuHeight - GAP)
        : rect.bottom + GAP;
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - 8,
    );
    setPosition({ top, left });
    itemRefs.current[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        close(false);
      }
    };
    const onScrollOrResize = () => close(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, close]);

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const elements = itemRefs.current.filter(
      (el): el is HTMLElement => el !== null,
    );
    const current = elements.indexOf(document.activeElement as HTMLElement);
    const focusAt = (index: number) =>
      elements[(index + elements.length) % elements.length]?.focus();

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(elements.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  const itemClass = (danger?: boolean) =>
    `text-body flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left transition-colors outline-none focus-visible:bg-hover hover:bg-hover ${
      danger ? "text-error" : "text-fg"
    }`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`focus-visible:ring-accent inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none ${
          open
            ? "bg-hover text-fg"
            : "text-fg-muted hover:bg-hover hover:text-fg"
        } ${className}`}
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            style={{
              top: position.top,
              left: position.left,
              width: MENU_WIDTH,
            }}
            className="border-border bg-bg shadow-pop fixed z-50 rounded-lg border p-1.5"
          >
            {items.map((item, index) => (
              <div key={item.key}>
                {item.separatorBefore && (
                  <div role="separator" className="bg-border my-1.5 h-px" />
                )}
                {item.href ? (
                  <Link
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    href={item.href}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => close(false)}
                    className={itemClass(item.danger)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      close(false);
                      item.onSelect?.();
                    }}
                    className={itemClass(item.danger)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export default ActionMenu;
