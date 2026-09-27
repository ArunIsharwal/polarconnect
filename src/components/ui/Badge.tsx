type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "green" | "red";
};

export default function Badge({
  children,
  tone = "neutral",
}: BadgeProps) {
  const styles = {
    neutral: "border-neutral-200 text-neutral-500",
    amber: "border-amber-200 text-amber-700",
    green: "border-emerald-200 text-emerald-700",
    red: "border-red-200 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 border px-2 py-1 font-mono text-[9px] uppercase tracking-widest ${styles[tone]}`}
    >
      <span
        className={`h-1 w-1 ${
          tone === "green"
            ? "bg-emerald-500"
            : tone === "amber"
              ? "bg-amber-500"
              : tone === "red"
                ? "bg-red-500"
                : "bg-neutral-400"
        }`}
      />

      {children}
    </span>
  );
}