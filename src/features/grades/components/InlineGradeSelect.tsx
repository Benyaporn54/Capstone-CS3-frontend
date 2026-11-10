"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { GradeEnrollment, GradeValue } from "@/types/grade";
import { GRADE_VALUES } from "@/types/grade";
import { saveGradeAction } from "../actions";

const OPTION_HEIGHT = 28;
const MENU_PADDING = 4;
const VIEWPORT_GAP = 8;

type InlineGradeSelectProps = {
  enrollment: GradeEnrollment;
  onSaved: (enrollmentId: number, grade: GradeValue) => void;
};

export default function InlineGradeSelect({
  enrollment,
  onSaved,
}: InlineGradeSelectProps) {
  const [grade, setGrade] = useState<GradeValue | "">(
    enrollment.currentGrade ?? "",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const savingRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const savedGradeRef = useRef<GradeValue | "">(enrollment.currentGrade ?? "");

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false);
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = () => {
    if (savingRef.current) return;
    setErrorMessage("");
    setNeedsSignIn(false);
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = Math.min(
      GRADE_VALUES.length * OPTION_HEIGHT + MENU_PADDING * 2,
      window.innerHeight - VIEWPORT_GAP * 2,
    );
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const availableHeight = openAbove ? spaceAbove : spaceBelow;
    const width = Math.max(rect.width, 64);
    const left = Math.min(
      Math.max(VIEWPORT_GAP, rect.left),
      window.innerWidth - width - VIEWPORT_GAP,
    );
    const top = openAbove
      ? Math.max(VIEWPORT_GAP, rect.top - Math.min(menuHeight, availableHeight))
      : rect.bottom;

    setPosition({
      top,
      left,
      width,
      maxHeight: Math.max(OPTION_HEIGHT + MENU_PADDING * 2, availableHeight),
    });

    const selectedIndex = GRADE_VALUES.findIndex(
      (value) => value === grade,
    );
    optionRefs.current[selectedIndex >= 0 ? selectedIndex : 0]?.focus();
  }, [open, grade]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };
    const onScrollOrResize = () => closeMenu();

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, closeMenu]);

  function focusOption(index: number) {
    const wrappedIndex = (index + GRADE_VALUES.length) % GRADE_VALUES.length;
    optionRefs.current[wrappedIndex]?.focus();
  }

  function handleOptionKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(GRADE_VALUES.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === "Tab") {
      closeMenu();
    }
  }

  async function handleGradeChange(nextGrade: GradeValue) {
    if (savingRef.current || nextGrade === savedGradeRef.current) {
      closeMenu();
      return;
    }

    closeMenu();
    savingRef.current = true;
    setSaving(true);
    setGrade(nextGrade);
    setErrorMessage("");
    setNeedsSignIn(false);

    try {
      const result = await saveGradeAction({
        enrollmentId: enrollment.enrollmentId,
        grade: nextGrade,
      });

      if (!result.ok) {
        setGrade(savedGradeRef.current);
        setErrorMessage(result.message);
        setNeedsSignIn(result.signIn === true);
        return;
      }

      savedGradeRef.current = result.grade.grade;
      setGrade(result.grade.grade);
      onSaved(result.grade.enrollmentId, result.grade.grade);
    } catch (error) {
      console.error("Inline grade save action failed:", error);
      setGrade(savedGradeRef.current);
      setErrorMessage("ระบบขัดข้อง ไม่สามารถบันทึกเกรดได้ กรุณาลองอีกครั้ง");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className={`flex shrink-0 flex-col items-end gap-1 ${
          errorMessage ? "w-48 max-w-[55vw]" : "w-14"
        }`}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={`เกรด ${enrollment.courseCode}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          disabled={saving}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && !open) {
              event.preventDefault();
              openMenu();
            }
          }}
          className={`bg-bg text-label focus-visible:ring-accent flex h-7 w-14 shrink-0 items-center justify-center gap-1 rounded-md border px-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
            errorMessage
              ? "border-error text-error"
              : open
                ? "border-accent text-fg"
                : "border-border text-fg hover:border-border-strong"
          }`}
        >
          {saving ? (
            <LoaderCircle
              size={13}
              aria-label="กำลังบันทึกเกรด"
              className="animate-spin"
            />
          ) : (
            <>
              <span>{grade || "เกรด"}</span>
              <ChevronDown
                size={13}
                aria-hidden
                className={`text-fg-muted transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {saving && (
          <span
            role="status"
            className="text-caption text-fg-muted flex items-center gap-1"
          >
            กำลังบันทึก
          </span>
        )}
        {errorMessage && (
          <p
            role="alert"
            className="text-caption text-error w-full text-right break-words"
          >
            {errorMessage}
            {needsSignIn && (
              <>
                {" "}
                <Link
                  href="/login?callbackUrl=%2Fplanner"
                  className="font-semibold underline"
                >
                  เข้าสู่ระบบใหม่
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="listbox"
            aria-label={`เลือกเกรด ${enrollment.courseCode}`}
            onKeyDown={(event) =>
              handleOptionKeyDown(
                event,
                optionRefs.current.indexOf(
                  document.activeElement as HTMLButtonElement,
                ),
              )
            }
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className="border-border bg-bg shadow-pop fixed z-[70] overflow-y-auto rounded-md border p-1"
          >
            {GRADE_VALUES.map((value, index) => (
              <button
                key={value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={grade === value}
                tabIndex={-1}
                onClick={() => void handleGradeChange(value)}
                className={`text-label flex h-7 w-full items-center justify-center rounded-sm outline-none transition-colors ${
                  grade === value
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-fg hover:bg-hover focus-visible:bg-hover"
                }`}
              >
                {value}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
