import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section"> & {
  variant?: "default" | "surface";
};

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={`border-border rounded-lg border ${variant === "surface" ? "bg-surface" : "bg-bg"} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
