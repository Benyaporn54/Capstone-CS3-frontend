"use client";

import React, { InputHTMLAttributes, useId } from "react";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
    const switchId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={switchId}
          className={`inline-flex cursor-pointer items-center gap-3 select-none ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              role="switch"
              id={switchId}
              disabled={disabled}
              checked={checked}
              defaultChecked={defaultChecked}
              className={`peer bg-border-strong checked:bg-accent focus:ring-accent/30 disabled:bg-surface h-6 w-11 cursor-pointer appearance-none rounded-full transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${className} `}
              {...props}
            />
            {/* Sliding Thumb Circle */}
            <div className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
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
            className={`text-caption pl-14 ${
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

Switch.displayName = "Switch";

export default Switch;