"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Download,
  ExternalLink,
  FileSearch,
} from "lucide-react";

type DatasetDocument = {
  _id: string;
  title: string;
  contentType?: string;
  region?: string;
  year?: number;
  description?: string;
  tags?: string[];
  fileName?: string;
  fileUrl?: string;
  status?: string;
  createdAt?: string;
};

export default function DatasetsPage() {
  const [documents, setDocuments] = useState<
    DatasetDocument[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/documents",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to load datasets",
          );
        }

        const allDocuments: DatasetDocument[] =
          Array.isArray(result.documents)
            ? result.documents
            : [];

        const approvedDatasets =
          allDocuments.filter(
            (document) =>
              (
                document.status || ""
              ).toUpperCase() === "APPROVED" &&
              (
                document.contentType || ""
              ).toUpperCase() === "DATASET",
          );

        setDocuments(
          approvedDatasets,
        );
      } catch (error) {
        console.error(
          "Dataset loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load datasets.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDatasets();
  }, []);

  const filteredDatasets =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return documents;
      }

      return documents.filter(
        (document) =>
          document.title
            .toLowerCase()
            .includes(value) ||
          (
            document.description || ""
          )
            .toLowerCase()
            .includes(value) ||
          (
            document.region || ""
          )
            .toLowerCase()
            .includes(value) ||
          (
            document.fileName || ""
          )
            .toLowerCase()
            .includes(value) ||
          (
            document.tags || []
          ).some((tag) =>
            tag
              .toLowerCase()
              .includes(value),
          ),
      );
    }, [documents, search]);

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER */}
      <section className="border border-neutral-200">
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            DATA / SCIENTIFIC RECORDS
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Datasets
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Browse approved scientific datasets indexed in the
                PolarConnect knowledge repository.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />
              DATABASE ONLINE
            </div>
          </div>
        </div>

        {/* SEARCH */}
        {/* <div className="border-b border-neutral-200 p-4">
          <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Search datasets
          </label>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search title, region, tags or filename..."
            className="mt-2 h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
          />
        </div> */}

        {/* STATUS */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {loading
              ? "LOADING DATASETS..."
              : `${filteredDatasets.length} DATASETS FOUND`}
          </div>

          <Database className="h-4 w-4 stroke-[1.5] text-neutral-400" />
        </div>

        {/* ERROR */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

              <p className="mt-3 text-xs text-neutral-500">
                Loading approved datasets...
              </p>
            </div>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <FileSearch className="h-6 w-6 stroke-[1.5] text-neutral-400" />

            <h2 className="mt-4 text-sm font-semibold">
              No datasets found
            </h2>

            <p className="mt-1 max-w-md text-xs leading-5 text-neutral-500">
              {documents.length === 0
                ? "There are currently no approved DATASET records in the repository."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div>
            {/* TABLE HEADER */}
            <div className="hidden grid-cols-[minmax(0,1fr)_140px_100px_180px] gap-4 border-b border-neutral-200 px-4 py-3 md:grid">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                DATASET
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                REGION
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                YEAR
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                ACTIONS
              </span>
            </div>

            {filteredDatasets.map(
              (dataset) => (
                <DatasetRow
                  key={dataset._id}
                  dataset={dataset}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function DatasetRow({
  dataset,
}: {
  dataset: DatasetDocument;
}) {
  return (
    <article className="border-b border-neutral-200 px-4 py-5 last:border-b-0 hover:bg-neutral-50">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_140px_100px_180px] md:items-start">
        {/* DATASET INFO */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0 stroke-[1.5] text-neutral-500" />

            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              DATASET
            </div>

            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600">
              APPROVED
            </span>
          </div>

          <h2 className="mt-2 text-sm font-semibold tracking-tight">
            {dataset.title}
          </h2>

          {dataset.fileName && (
            <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              {dataset.fileName}
            </div>
          )}

          <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-500">
            {dataset.description ||
              "No description available."}
          </p>

          {dataset.tags &&
            dataset.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {dataset.tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="border border-neutral-200 px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-neutral-500"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            )}
        </div>

        {/* REGION */}
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 md:hidden">
            REGION
          </div>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600 md:mt-0">
            {dataset.region ||
              "UNKNOWN"}
          </div>
        </div>

        {/* YEAR */}
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 md:hidden">
            YEAR
          </div>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600 md:mt-0">
            {dataset.year || "—"}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2">
          {dataset.fileUrl && (
            <a
              href={dataset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-2 border border-neutral-200 px-3 text-[10px] font-medium hover:bg-white"
            >
              <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
              Open
            </a>
          )}

          {dataset.fileUrl && (
            <a
              href={dataset.fileUrl}
              download={
                dataset.fileName || true
              }
              className="inline-flex h-8 items-center gap-2 bg-black px-3 text-[10px] font-medium text-white hover:bg-neutral-800"
            >
              <Download className="h-3.5 w-3.5 stroke-[1.5]" />
              Download
            </a>
          )}
        </div>
      </div>
    </article>
  );
}