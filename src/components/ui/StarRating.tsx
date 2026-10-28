"use client";
import React, { useState } from "react";

export interface StarRatingProps {
  label?: string;
  maxStars?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  helperText?: string;
  errorMessage?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  label,
  maxStars = 5,
  value,
  defaultValue = 0,
  onChange,
  readOnly = false,
  disabled = false,
  helperText,
  errorMessage,
}) => {
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleClick = (starIndex: number) => {
    if (readOnly || disabled) return;
    if (value === undefined) {
      setInternalValue(starIndex);
    }
    onChange?.(starIndex);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span
          className={`text-body font-medium ${
            disabled ? "text-fg-muted" : "text-fg"
          }`}
        >
          {label}
        </span>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starIndex = index + 1;
          const isFilled =
            (hoverValue !== null ? hoverValue : currentValue) >= starIndex;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={disabled || readOnly}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() =>
                !readOnly && !disabled && setHoverValue(starIndex)
              }
              onMouseLeave={() => !readOnly && !disabled && setHoverValue(null)}
              className={`rounded p-0.5 transition-transform ${
                readOnly || disabled
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110 focus:outline-none"
              } ${disabled ? "opacity-40" : ""}`}
            >
              <svg
                className={`h-6 w-6 transition-colors ${
                  isFilled
                    ? "fill-[#F97316] text-[#F97316]" // ส้มสดตามดีไซน์ในรูป
                    : "text-border-strong fill-transparent"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>

      {(errorMessage || helperText) && (
        <p
          className={`text-caption ${
            errorMessage ? "text-error" : "text-fg-muted"
          }`}
        >
          {errorMessage || helperText}
        </p>
      )}
    </div>
  );
};

export default StarRating;