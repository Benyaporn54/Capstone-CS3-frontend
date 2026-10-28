import React, { SelectHTMLAttributes, useId } from "react";

export interface SelectOption {
  label: string | number;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  isError?: boolean;
  placeholder?: string;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      errorMessage,
      isError = false,
      placeholder,
      disabled,
      defaultValue,
      value,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = isError || Boolean(errorMessage);

    const computedDefaultValue =
      value !== undefined
        ? undefined
        : defaultValue !== undefined
          ? defaultValue
          : placeholder
            ? ""
            : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={`text-body font-medium transition-colors ${
              disabled ? "text-fg-muted" : "text-fg"
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative flex w-full items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            defaultValue={computedDefaultValue}
            className={`text-body bg-bg text-fg /* Border & Focus States */ h-10 w-full cursor-pointer appearance-none rounded-md border px-3.5 pr-10 transition-colors outline-none ${
              hasError
                ? "border-error focus:border-error focus:ring-error focus:ring-1"
                : "border-border focus:border-accent focus:ring-accent focus:ring-1"
            } /* Disabled State */ disabled:bg-surface disabled:border-border disabled:text-fg-muted disabled:cursor-not-allowed ${className} `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-bg text-fg"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="text-fg-muted pointer-events-none absolute right-3.5">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {(errorMessage || helperText) && (
          <p
            className={`text-caption ${
              hasError ? "text-error" : "text-fg-muted"
            }`}
          >
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export default Dropdown;