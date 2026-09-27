type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export default function MetricCard({
  label,
  value,
  detail,
}: MetricCardProps) {
  return (
    <div className="border-b border-neutral-200 p-4 sm:p-5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="mt-3 font-mono text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {detail}
      </div>
    </div>
  );
}