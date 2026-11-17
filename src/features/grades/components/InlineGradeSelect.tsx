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
import { deleteGradeAction, saveGradeAction } from "../actions";

const OPTION_HEIGHT = 28;
const MENU_PADDING = 4;
const VIEWPORT_GAP = 8;
const GRADE_OPTIONS = ["", ...GRADE_VALUES] as const;

type InlineGradeSelectProps = {
  enrollment: GradeEnrollment;
  onSaved: (enrollmentId: number, grade: GradeValue | null) => void;
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
  const [savingOperation, setSavingOperation] = useState<
    "save" | "delete" | null
  >(null);
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
      GRADE_OPTIONS.length * OPTION_HEIGHT + MENU_PADDING * 2,
      window.innerHeight - VIEWPORT_GAP * 2,
    );
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const availableHeight = openAbove ? spaceAbove : spaceBelow;
    const width = Math.min(
      Math.max(rect.width, 128),
      window.innerWidth - VIEWPORT_GAP * 2,
    );
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

    const selectedIndex = GRADE_OPTIONS.findIndex((value) => value === grade);
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
    const wrappedIndex = (index + GRADE_OPTIONS.length) % GRADE_OPTIONS.length;
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
      focusOption(GRADE_OPTIONS.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === "Tab") {
      closeMenu();
    }
  }

  async function handleGradeChange(nextGrade: GradeValue | "") {
    if (savingRef.current || nextGrade === savedGradeRef.current) {
      closeMenu();
      return;
    }

    closeMenu();
    savingRef.current = true;
    setSavingOperation(nextGrade === "" ? "delete" : "save");
    setErrorMessage("");
    setNeedsSignIn(false);

    try {
      if (nextGrade === "") {
        const result = await deleteGradeAction({
          enrollmentId: enrollment.enrollmentId,
        });

        if (!result.ok) {
          setErrorMessage(result.message);
          setNeedsSignIn(result.signIn === true);
          return;
        }

        savedGradeRef.current = "";
        setGrade("");
        onSaved(result.enrollmentId, null);
        return;
      }

      const result = await saveGradeAction({
        enrollmentId: enrollment.enrollmentId,
        grade: nextGrade,
      });

      if (!result.ok) {
        setErrorMessage(result.message);
        setNeedsSignIn(result.signIn === true);
        return;
      }

      savedGradeRef.current = result.grade.grade;
      setGrade(result.grade.grade);
      onSaved(result.grade.enrollmentId, result.grade.grade);
    } catch (error) {
      console.error("Inline grade change action failed:", error);
      setErrorMessage(
        nextGrade === ""
          ? "ระบบขัดข้อง ไม่สามารถลบเกรดได้ กรุณาลองอีกครั้ง"
          : "ระบบขัดข้อง ไม่สามารถบันทึกเกรดได้ กรุณาลองอีกครั้ง",
      );
    } finally {
      savingRef.current = false;
      setSavingOperation(null);
    }
  }

  return (
    <>
      <div
        className={`flex shrink-0 flex-col items-end gap-1 ${
          errorMessage ? "w-48 max-w-[55vw]" : grade === "" ? "w-32" : "w-14"
        }`}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={`เกรด ${enrollment.courseCode}: ${grade || "ไม่กรอกเกรด"}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-busy={savingOperation !== null}
          disabled={savingOperation !== null}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && !open) {
              event.preventDefault();
              openMenu();
            }
          }}
          className={`bg-bg text-label focus-visible:ring-accent flex h-7 ${
            grade === "" || savingOperation === "delete" ? "w-32" : "w-14"
          } shrink-0 items-center justify-center gap-1 rounded-md border px-2 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
            errorMessage
              ? "border-error text-error"
              : open
                ? "border-accent text-fg"
                : "border-border text-fg hover:border-border-strong"
          }`}
        >
          {savingOperation !== null ? (
            <>
              <LoaderCircle size={13} aria-hidden className="animate-spin" />
              <span className="whitespace-nowrap">
                {savingOperation === "delete" ? "กำลังลบ" : "กำลังบันทึก"}
              </span>
            </>
          ) : (
            <>
              <span className={grade === "" ? "whitespace-nowrap" : ""}>
                {grade || "ไม่กรอกเกรด"}
              </span>
              <ChevronDown
                size={13}
                aria-hidden
                className={`text-fg-muted shrink-0 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>

        {savingOperation !== null && (
          <span role="status" className="sr-only">
            {savingOperation === "delete" ? "กำลังลบเกรด" : "กำลังบันทึกเกรด"}
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
            {GRADE_OPTIONS.map((value, index) => (
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
                className={`text-label flex h-7 w-full items-center justify-center rounded-sm px-2 whitespace-nowrap transition-colors outline-none ${
                  grade === value
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-fg hover:bg-hover focus-visible:bg-hover"
                }`}
              >
                {value || "ไม่กรอกเกรด"}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
