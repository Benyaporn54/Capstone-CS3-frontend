import React, { TextareaHTMLAttributes, useId } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isError?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      isError = false,
      disabled,
      className = "",
      id,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const hasError = isError || Boolean(errorMessage);

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className={`text-body font-medium transition-colors ${
              disabled ? "text-fg-muted" : "text-fg"
            }`}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={`text-body bg-bg text-fg placeholder:text-fg-muted /* Border & Focus States */ w-full resize-y rounded-md border p-3.5 transition-colors outline-none ${
            hasError
              ? "border-error focus:border-error focus:ring-error focus:ring-1"
              : "border-border focus:border-accent focus:ring-accent focus:ring-1"
          } /* Disabled State */ disabled:bg-surface disabled:border-border disabled:text-fg-muted disabled:cursor-not-allowed ${className} `}
          {...props}
        />

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

TextArea.displayName = "TextArea";

export default TextArea;
