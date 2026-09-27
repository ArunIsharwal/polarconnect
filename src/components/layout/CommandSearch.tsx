"use client";

import { FormEvent, useState } from "react";
import { Command, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/repository");
      return;
    }

    router.push(
      `/repository?search=${encodeURIComponent(trimmedQuery)}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-9 min-w-0 flex-1 items-center border border-neutral-200 bg-white px-3 sm:max-w-xl"
    >
      <Search className="mr-2 h-4 w-4 shrink-0 stroke-[1.5] text-neutral-400" />

      <input
        type="search"
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder="Search reports, datasets, expeditions..."
        aria-label="Search PolarConnect repository"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
      />

      <button
        type="submit"
        className="hidden items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400 sm:flex hover:text-black"
        aria-label="Search"
      >
        <Command className="h-3 w-3 stroke-[1.5]" />
        K
      </button>
    </form>
  );
}