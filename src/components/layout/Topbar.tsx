import Link from "next/link";
import { Upload } from "lucide-react";

import { CommandSearch } from "./CommandSearch";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 sm:px-6">
      <CommandSearch />

      <div className="hidden items-center gap-4 sm:flex">
        <div className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          <span className="h-1 w-1 animate-pulse bg-emerald-500" />
          Live
        </div>

        <Link
          href="/admin/documents"
          className="inline-flex h-8 items-center gap-2 rounded-sm border border-neutral-200 px-3 text-xs font-medium hover:bg-neutral-50"
        >
          <Upload className="h-4 w-4 stroke-[1.5]" />
          Upload
        </Link>
      </div>
    </header>
  );
}