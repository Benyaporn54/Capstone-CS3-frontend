type MetricBarProps = {
  value: number;
  max?: number;
};

export default function MetricBar({ value, max = 5 }: MetricBarProps) {
  const filled = Math.round(value);

  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: max }).map((_, index) => (
        <span
          key={index}
          className={`h-1.5 w-3 rounded-sm ${
            index < filled ? "bg-accent" : "bg-border"
          }`}
        />
      ))}
    </span>
  );
}
