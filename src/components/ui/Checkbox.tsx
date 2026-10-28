"use client";

import React, { InputHTMLAttributes, useId } from "react";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      disabled,
      className = "",
      id,
      checked,
      defaultChecked,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`inline-flex cursor-pointer items-center gap-2.5 select-none ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={checked}
              defaultChecked={defaultChecked}
              className={`peer bg-bg border-border-strong checked:bg-accent checked:border-accent focus:ring-accent/30 disabled:bg-surface disabled:border-border h-5 w-5 cursor-pointer appearance-none rounded border transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${className} `}
              {...props}
            />
            {/* Checkmark Icon */}
            <svg
              className="text-accent-fg pointer-events-none absolute h-3.5 w-3.5 opacity-0 transition-opacity peer-checked:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          {label && (
            <span
              className={`text-body ${disabled ? "text-fg-muted" : "text-fg"}`}
            >
              {label}
            </span>
          )}
        </label>

        {(errorMessage || helperText) && (
          <p
            className={`text-caption pl-7 ${
              errorMessage ? "text-error" : "text-fg-muted"
            }`}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;