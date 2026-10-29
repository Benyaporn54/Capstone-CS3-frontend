import React, { InputHTMLAttributes, ReactNode, useId } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isError?: boolean;
  leftIcon?: ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      isError = false,
      leftIcon,
      disabled,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = isError || Boolean(errorMessage);

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-body font-medium transition-colors ${
              disabled ? "text-fg-muted" : "text-fg"
            }`}
          >
            {label}
          </label>
        )}

        <div className="relative flex w-full items-center">
          {leftIcon && (
            <div className="text-fg-muted pointer-events-none absolute left-3 flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`text-body bg-bg text-fg placeholder:text-fg-muted h-10 w-full rounded-md transition-colors outline-none ${leftIcon ? "pr-3.5 pl-9" : "px-3.5"} /* Border & Focus States */ border ${
              hasError
                ? "border-error focus:border-error focus:ring-error focus:ring-1"
                : "border-border focus:border-accent focus:ring-accent focus:ring-1"
            } /* Disabled State */ disabled:bg-surface disabled:border-border disabled:text-fg-muted disabled:cursor-not-allowed ${className} `}
            {...props}
          />
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

TextField.displayName = "TextField";

export default TextField;
