"use client";

import React, { InputHTMLAttributes, useId } from "react";

export interface RadioButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  helperText?: string;
  errorMessage?: string;
}

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
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
    const radioId = id || generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={radioId}
          className={`inline-flex cursor-pointer items-center gap-2.5 select-none ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              disabled={disabled}
              checked={checked}
              defaultChecked={defaultChecked}
              className={`peer bg-bg border-border-strong checked:border-accent focus:ring-accent/30 disabled:bg-surface disabled:border-border h-5 w-5 cursor-pointer appearance-none rounded-full border transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed ${className} `}
              {...props}
            />
            {/* Radio Inner Dot */}
            <div className="bg-accent pointer-events-none absolute h-2.5 w-2.5 rounded-full opacity-0 transition-opacity peer-checked:opacity-100" />
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

RadioButton.displayName = "RadioButton";

export default RadioButton;