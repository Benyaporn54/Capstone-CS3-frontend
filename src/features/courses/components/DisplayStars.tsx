import { Star } from "lucide-react";

type DisplayStarsProps = {
  value: number;
  size?: number;
};

export default function DisplayStars({ value, size = 16 }: DisplayStarsProps) {
  return (
    <span className="inline-flex items-center" aria-label={`${value} จาก 5 ดาว`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < Math.round(value);
        return (
          <Star
            key={index}
            size={size}
            className={
              filled
                ? "text-signature fill-signature"
                : "text-border-strong fill-transparent"
            }
          />
        );
      })}
    </span>
  );
}
