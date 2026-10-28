import React, { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger-light";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "h-9 px-[14px] inline-flex items-center justify-center rounded-md text-body font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-accent text-accent-fg hover:bg-accent-hover active:opacity-90 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg",

    secondary:
      "border border-border-fg bg-bg text-fg hover:bg-hover active:bg-hover/80",

    ghost: "bg-transparent text-fg hover:bg-hover active:bg-hover/80",

    "danger-light":
      "bg-error-soft text-error hover:bg-error-soft/80 active:bg-error-soft/60",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;