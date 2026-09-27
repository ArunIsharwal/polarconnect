"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  Compass,
  MapPin,
  Ship,
  UserRound,
} from "lucide-react";

type Expedition = {
  _id: string;

  name: string;

  code: string;

  region: string;

  status:
    | "PLANNED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";

  startDate?: string;

  endDate?: string;

  location?: string;

  vessel?: string;

  lead?: string;

  organization?: string;

  researchFocus?: string;

  description?: string;

  tags?: string[];

  coverImageUrl?: string;

  latitude?: number;

  longitude?: number;
};

export default function ExpeditionsPage() {
  const [expeditions, setExpeditions] =
    useState<Expedition[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [
    selectedExpedition,
    setSelectedExpedition,
  ] =
    useState<Expedition | null>(
      null,
    );

  useEffect(() => {
    async function loadExpeditions() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/expeditions",
            {
              method: "GET",
              cache: "no-store",
            },
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load expeditions",
          );
        }

        setExpeditions(
          Array.isArray(
            result.expeditions,
          )
            ? result.expeditions
            : [],
        );
      } catch (error) {
        console.error(
          "Expedition loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load expeditions.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadExpeditions();
  }, []);

  const filteredExpeditions =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      return expeditions.filter(
        (expedition) => {
          const matchesSearch =
            !value ||
            expedition.name
              .toLowerCase()
              .includes(value) ||
            expedition.code
              .toLowerCase()
              .includes(value) ||
            expedition.region
              .toLowerCase()
              .includes(value) ||
            (
              expedition.location ||
              ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              expedition.vessel ||
              ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              expedition.lead ||
              ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              expedition.researchFocus ||
              ""
            )
              .toLowerCase()
              .includes(value) ||
            (
              expedition.tags || []
            ).some((tag) =>
              tag
                .toLowerCase()
                .includes(value),
            );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            expedition.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      expeditions,
      search,
      statusFilter,
    ]);

  const activeCount =
    expeditions.filter(
      (item) =>
        item.status === "ACTIVE",
    ).length;

  const plannedCount =
    expeditions.filter(
      (item) =>
        item.status === "PLANNED",
    ).length;

  const completedCount =
    expeditions.filter(
      (item) =>
        item.status === "COMPLETED",
    ).length;

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER */}
      <section className="border border-neutral-200">
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            EXPEDITION / EXPLORER
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Expeditions
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Explore field missions, polar research
                campaigns and expedition records indexed by
                PolarConnect.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />

              DATABASE ONLINE
            </div>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-3 gap-px bg-neutral-200">
          <SummaryCard
            label="Active"
            value={activeCount}
          />

          <SummaryCard
            label="Planned"
            value={plannedCount}
          />

          <SummaryCard
            label="Completed"
            value={completedCount}
          />
        </div>

        {/* CONTROLS */}
        <div className="grid border-t border-neutral-200 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="p-4">
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Search expeditions
            </label>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search name, code, region, vessel..."
              className="mt-2 h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="border-t border-neutral-200 p-4 md:border-l md:border-t-0">
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-10 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-black"
            >
              <option value="ALL">
                ALL
              </option>

              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="PLANNED">
                PLANNED
              </option>

              <option value="COMPLETED">
                COMPLETED
              </option>

              <option value="CANCELLED">
                CANCELLED
              </option>
            </select>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {loading
              ? "LOADING EXPEDITIONS..."
              : `${filteredExpeditions.length} EXPEDITIONS FOUND`}
          </div>

          <Compass className="h-4 w-4 stroke-[1.5] text-neutral-400" />
        </div>

        {/* ERROR */}
        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

              <p className="mt-3 text-xs text-neutral-500">
                Loading expedition registry...
              </p>
            </div>
          </div>
        ) : filteredExpeditions.length ===
          0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Compass className="h-7 w-7 stroke-[1.5] text-neutral-400" />

            <h2 className="mt-4 text-sm font-semibold">
              No expeditions recorded
            </h2>

            <p className="mt-1 max-w-md text-xs leading-5 text-neutral-500">
              Expedition records will appear here once
              they are added to the PolarConnect registry.
            </p>

            <div className="mt-4 border border-neutral-200 px-3 py-2 font-mono text-[8px] uppercase tracking-widest text-neutral-400">
              REGISTRY / READY FOR DATA
            </div>
          </div>
        ) : (
          /* EXPEDITION LIST */
          <div>
            {filteredExpeditions.map(
              (expedition) => (
                <ExpeditionRow
                  key={expedition._id}
                  expedition={expedition}
                  onOpen={() =>
                    setSelectedExpedition(
                      expedition,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </section>

      {/* DETAIL PANEL */}
      {selectedExpedition && (
        <ExpeditionModal
          expedition={
            selectedExpedition
          }
          onClose={() =>
            setSelectedExpedition(
              null,
            )
          }
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="mt-3 text-2xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function ExpeditionRow({
  expedition,
  onOpen,
}: {
  expedition: Expedition;
  onOpen: () => void;
}) {
  const statusClass =
    expedition.status === "ACTIVE"
      ? "text-emerald-600"
      : expedition.status ===
          "COMPLETED"
        ? "text-neutral-500"
        : expedition.status ===
            "CANCELLED"
          ? "text-red-600"
          : "text-amber-600";

  return (
    <article className="border-b border-neutral-200 px-4 py-5 last:border-b-0 hover:bg-neutral-50">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_120px_auto] lg:items-center">
        {/* MAIN */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              {expedition.code}
            </span>

            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              {expedition.region}
            </span>

            <span
              className={`font-mono text-[9px] uppercase tracking-widest ${statusClass}`}
            >
              {expedition.status}
            </span>
          </div>

          <h2 className="mt-2 text-sm font-semibold tracking-tight">
            {expedition.name}
          </h2>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
            {expedition.description ||
              expedition.researchFocus ||
              "No expedition description available."}
          </p>
        </div>

        {/* LOCATION */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 stroke-[1.5] text-neutral-400" />

            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              LOCATION
            </span>
          </div>

          <div className="mt-2 text-xs">
            {expedition.location ||
              "—"}
          </div>
        </div>

        {/* DATES */}
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 stroke-[1.5] text-neutral-400" />

            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              PERIOD
            </span>
          </div>

          <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-600">
            {formatDate(
              expedition.startDate,
            )}
          </div>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            TO{" "}
            {formatDate(
              expedition.endDate,
            )}
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 items-center justify-center gap-2 border border-neutral-200 px-3 text-[10px] font-medium hover:bg-white"
        >
          Details

          <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
        </button>
      </div>
    </article>
  );
}

function ExpeditionModal({
  expedition,
  onClose,
}: {
  expedition: Expedition;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-auto border border-neutral-300 bg-white"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-5">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              EXPEDITION /{" "}
              {expedition.code}
            </div>

            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {expedition.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center border border-neutral-200 hover:bg-neutral-50"
          >
            ×
          </button>
        </div>

        <div className="grid gap-px bg-neutral-200 md:grid-cols-2">
          <Detail
            icon={MapPin}
            label="Region"
            value={
              expedition.region
            }
          />

          <Detail
            icon={Compass}
            label="Status"
            value={
              expedition.status
            }
          />

          <Detail
            icon={CalendarDays}
            label="Start"
            value={formatDate(
              expedition.startDate,
            )}
          />

          <Detail
            icon={CalendarDays}
            label="End"
            value={formatDate(
              expedition.endDate,
            )}
          />

          <Detail
            icon={MapPin}
            label="Location"
            value={
              expedition.location ||
              "Not specified"
            }
          />

          <Detail
            icon={Ship}
            label="Vessel"
            value={
              expedition.vessel ||
              "Not specified"
            }
          />

          <Detail
            icon={UserRound}
            label="Lead"
            value={
              expedition.lead ||
              "Not specified"
            }
          />

          <Detail
            icon={UserRound}
            label="Organization"
            value={
              expedition.organization ||
              "Not specified"
            }
          />
        </div>

        <div className="border-t border-neutral-200 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            RESEARCH FOCUS
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {expedition.researchFocus ||
              "No research focus recorded."}
          </p>
        </div>

        <div className="border-t border-neutral-200 p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            DESCRIPTION
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {expedition.description ||
              "No description recorded."}
          </p>
        </div>

        {expedition.tags &&
          expedition.tags.length > 0 && (
            <div className="border-t border-neutral-200 p-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                TAGS
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {expedition.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="border border-neutral-200 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neutral-500"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

        <div className="border-t border-neutral-200 bg-neutral-50 p-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Close details
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 stroke-[1.5] text-neutral-400" />

        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {label}
        </span>
      </div>

      <div className="mt-2 text-xs font-medium">
        {value}
      </div>
    </div>
  );
}

function formatDate(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}