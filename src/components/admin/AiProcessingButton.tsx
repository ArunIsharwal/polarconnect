import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

export default function AiProcessingButton() {
  return (
    <Link
      href="/admin/ai"
      className="inline-flex h-9 items-center gap-2 border border-neutral-200 bg-white px-4 text-xs font-medium hover:border-black hover:bg-neutral-50"
    >
      <Sparkles className="h-4 w-4 stroke-[1.5]" />

      AI Processing

      <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5] text-neutral-400" />
    </Link>
  );
}