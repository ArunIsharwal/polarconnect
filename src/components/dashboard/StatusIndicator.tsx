type StatusIndicatorProps = {
  label: string;
  status: "live" | "syncing" | "offline";
};

export default function StatusIndicator({
  label,
  status,
}: StatusIndicatorProps) {
  const dot =
    status === "live"
      ? "bg-emerald-500"
      : status === "syncing"
        ? "bg-amber-500"
        : "bg-neutral-400";

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-600">
      <span className={`h-1.5 w-1.5 animate-pulse ${dot}`} />
      {label}
    </span>
  );
}