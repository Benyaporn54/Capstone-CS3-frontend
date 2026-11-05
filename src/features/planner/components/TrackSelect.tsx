"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { TrackListItem } from "@/types/track";

type TrackSelectProps = {
  label: string;
  tracks: TrackListItem[];
  /** null = ยังไม่เลือก Track */
  value: number | null;
  onChange: (trackId: number | null) => void;
  disabled?: boolean;
  helperText?: string;
};

type Option = { id: number | null; label: string };
type Group = { key: string; label: string | null; options: Option[] };

const NONE: Option = { id: null, label: "ยังไม่เลือก Track" };

/** dropdown เลือก Track แบ่งกลุ่มตาม track.group (เหมือนหน้า Track) */
export default function TrackSelect({
  label,
  tracks,
  value,
  onChange,
  disabled = false,
  helperText,
}: TrackSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const groups = useMemo<Group[]>(() => {
    const byGroup: Group[] = [{ key: "none", label: null, options: [NONE] }];
    for (const track of tracks) {
      const key = String(track.group?.id ?? 0);
      let group = byGroup.find((g) => g.key === key);
      if (!group) {
        group = { key, label: track.group?.nameTh ?? "ทั่วไป", options: [] };
        byGroup.push(group);
      }
      group.options.push({ id: track.id, label: track.nameEn || track.nameTh });
    }
    return byGroup;
  }, [tracks]);

  const flat = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selected = flat.find((o) => o.id === value) ?? NONE;

  // ปิดเมื่อคลิกนอก dropdown
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // เลื่อนให้ตัวเลือกที่ active มองเห็นเสมอ
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(Math.max(0, flat.indexOf(selected)));
    setOpen(true);
  };

  const choose = (option: Option) => {
    onChange(option.id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // ไม่ให้ปิด modal ทั้งอัน
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(flat[activeIndex]);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  let index = -1;

  return (
    <div ref={rootRef} className="relative flex w-full flex-col gap-1.5">
      <label
        id={`${id}-label`}
        className={`text-body font-medium ${disabled ? "text-fg-muted" : "text-fg"}`}
      >
        {label}
      </label>

      <button
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`text-body bg-bg flex h-10 w-full items-center justify-between rounded-md border px-3.5 text-left transition-colors outline-none ${
          open
            ? "border-accent ring-accent ring-1"
            : "border-border focus-visible:border-accent focus-visible:ring-accent focus-visible:ring-1"
        } disabled:bg-surface disabled:text-fg-muted disabled:cursor-not-allowed ${
          selected.id === null ? "text-fg-muted" : "text-fg"
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`text-fg-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {helperText && <p className="text-caption text-fg-muted">{helperText}</p>}

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="border-border bg-bg shadow-pop absolute top-[70px] right-0 left-0 z-20 max-h-80 overflow-y-auto rounded-md border p-1"
        >
          {groups.map((group) => (
            <li key={group.key} role="presentation">
              {group.label && (
                <p className="text-caption text-fg-muted px-2.5 pt-2 pb-1">
                  {group.label}
                </p>
              )}
              <ul role="group" aria-label={group.label ?? undefined}>
                {group.options.map((option) => {
                  index += 1;
                  const i = index;
                  const isSelected = option.id === selected.id;
                  return (
                    <li
                      key={option.id ?? "none"}
                      role="option"
                      data-index={i}
                      aria-selected={isSelected}
                      onPointerEnter={() => setActiveIndex(i)}
                      onClick={() => choose(option)}
                      className={`text-body flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 ${
                        isSelected ? "text-accent font-medium" : "text-fg"
                      } ${i === activeIndex ? (isSelected ? "bg-accent-soft" : "bg-hover") : isSelected ? "bg-accent-soft" : ""}`}
                    >
                      {option.label}
                      {isSelected && <Check size={16} aria-hidden />}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
