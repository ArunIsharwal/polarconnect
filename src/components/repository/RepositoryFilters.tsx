"use client";

type RepositoryFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
};

export default function RepositoryFilters({
  search,
  setSearch,
  type,
  setType,
  region,
  setRegion,
  year,
  setYear,
}: RepositoryFiltersProps) {
  return (
    <div className="grid border-b border-neutral-200 bg-neutral-50 md:grid-cols-4">
      <div className="border-b border-neutral-200 p-3 md:border-b-0 md:border-r">
        <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          Search
        </label>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records..."
          className="mt-2 h-8 w-full border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-black"
        />
      </div>

      <Filter
        label="Content type"
        value={type}
        setValue={setType}
        options={[
          "ALL",
          "REPORT",
          "DATASET",
          "PUBLICATION",
          "MEDIA",
        ]}
      />

      <Filter
        label="Region"
        value={region}
        setValue={setRegion}
        options={[
          "ALL",
          "ANTARCTICA",
          "ARCTIC",
          "SOUTHERN OCEAN",
          "MAITRI",
        ]}
      />

      <Filter
        label="Year"
        value={year}
        setValue={setYear}
        options={["ALL", "2026", "2025", "2024"]}
      />
    </div>
  );
}

function Filter({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="border-b border-neutral-200 p-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 h-8 w-full border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-black"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}