import { repositoryItems } from "@/data/mockData";
import RepositoryRow from "./RepositoryRow";

export default function RepositoryTable() {
  return (
    <section className="border border-neutral-200">
      <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Knowledge Repository
          </div>

          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Latest scientific records
          </h2>
        </div>

        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {repositoryItems.length} RECORDS
        </div>
      </div>

      {repositoryItems.map((item) => (
        <RepositoryRow key={item.id} item={item} />
      ))}
    </section>
  );
}