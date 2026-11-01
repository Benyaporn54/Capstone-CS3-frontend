import { User } from "lucide-react";

type AvatarSize = "sm" | "lg";

type AvatarProps = {
  /** Used for the initials, e.g. "BENYAPORN METHAWIWATKUL" → "BM" */
  name?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-label",
  lg: "h-20 w-20 text-h2",
};

const iconSize: Record<AvatarSize, number> = { sm: 18, lg: 36 };

export function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({
  name,
  size = "sm",
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      aria-hidden
      className={`bg-accent-soft text-accent inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none ${sizeStyles[size]} ${className}`}
    >
      {initials || <User size={iconSize[size]} />}
    </span>
  );
}
