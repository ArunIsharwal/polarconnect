"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";

import RepositoryFilters from "@/components/repository/RepositoryFilters";
import RepositoryRow from "@/components/repository/RepositoryRow";
import DocumentPreview from "@/components/repository/DocumentPreview";

type ApiDocument = {
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

  aiSummary?: string;
  aiStatus?:
    | "NOT_STARTED"
    | "PROCESSING"
    | "COMPLETE"
    | "FAILED";

  aiProcessedAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

type RepositoryDocument = {
  id: string;
  title: string;
  type:
    | "REPORT"
    | "DATASET"
    | "PUBLICATION"
    | "MEDIA";
  region: string;
  year: number;
  description: string;
  tags: string[];
  fileName: string;
  fileUrl: string;
  status: string;

  aiSummary: string;
  aiStatus:
    | "NOT_STARTED"
    | "PROCESSING"
    | "COMPLETE"
    | "FAILED";

  aiProcessedAt?: string;
};

const allowedTypes = [
  "REPORT",
  "DATASET",
  "PUBLICATION",
  "MEDIA",
] as const;

function mapApiDocument(
  document: ApiDocument,
): RepositoryDocument {
  const contentType = allowedTypes.includes(
    document.contentType as (typeof allowedTypes)[number],
  )
    ? (document.contentType as RepositoryDocument["type"])
    : "REPORT";

  const aiStatus =
    document.aiStatus === "PROCESSING" ||
    document.aiStatus === "COMPLETE" ||
    document.aiStatus === "FAILED"
      ? document.aiStatus
      : "NOT_STARTED";

  return {
    id: String(document._id),

    title:
      document.title || "Untitled document",

    type: contentType,

    region:
      document.region || "ANTARCTICA",

    year:
      document.year || 0,

    description:
      document.description || "",

    tags:
      Array.isArray(document.tags)
        ? document.tags
        : [],

    fileName:
      document.fileName || "",

    fileUrl:
      document.fileUrl || "",

    status:
      document.status || "PENDING",

    aiSummary:
      document.aiSummary || "",

    aiStatus,

    aiProcessedAt:
      document.aiProcessedAt,
  };
}

function RepositoryContent() {
  const searchParams = useSearchParams();

  const [documents, setDocuments] = useState<
    RepositoryDocument[]
  >([]);

  const [search, setSearch] = useState("");

  const [type, setType] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [year, setYear] = useState("ALL");

  const [selectedId, setSelectedId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const urlSearch =
    searchParams.get("search") || "";

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    async function loadDocuments() {
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
              "Failed to load documents",
          );
        }

        const apiDocuments: ApiDocument[] =
          Array.isArray(result.documents)
            ? result.documents
            : [];

        /*
         * Public repository only shows approved
         * documents.
         */
        const approvedDocuments =
          apiDocuments.filter(
            (document) =>
              (
                document.status || ""
              ).toUpperCase() === "APPROVED",
          );

        const mappedDocuments =
          approvedDocuments.map(
            mapApiDocument,
          );

        setDocuments(mappedDocuments);
      } catch (error) {
        console.error(
          "Repository loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load repository documents.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        searchValue === "" ||
        document.title
          .toLowerCase()
          .includes(searchValue) ||
        document.description
          .toLowerCase()
          .includes(searchValue) ||
        document.fileName
          .toLowerCase()
          .includes(searchValue) ||
        document.region
          .toLowerCase()
          .includes(searchValue) ||
        document.type
          .toLowerCase()
          .includes(searchValue) ||
        document.tags.some((tag) =>
          tag
            .toLowerCase()
            .includes(searchValue),
        );

      const matchesType =
        type === "ALL" ||
        document.type === type;

      const matchesRegion =
        region === "ALL" ||
        document.region === region;

      const matchesYear =
        year === "ALL" ||
        document.year.toString() === year;

      return (
        matchesSearch &&
        matchesType &&
        matchesRegion &&
        matchesYear
      );
    });
  }, [
    documents,
    search,
    type,
    region,
    year,
  ]);

  const selectedDocument =
    documents.find(
      (document) =>
        document.id === selectedId,
    ) ?? null;

  return (
    <div className="p-4 sm:p-6">
      <section className="border border-neutral-200">
        {/* HEADER */}
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            REPOSITORY / SCIENTIFIC RECORDS
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Knowledge Repository
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
            Search and explore research reports,
            publications, datasets and polar media
            records.
          </p>
        </div>

        {/* FILTERS */}
        <RepositoryFilters
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          region={region}
          setRegion={setRegion}
          year={year}
          setYear={setYear}
        />

        {/* STATUS BAR */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {loading
              ? "LOADING RECORDS..."
              : `${filteredDocuments.length} RECORDS FOUND`}
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            <span className="h-1 w-1 animate-pulse bg-emerald-500" />
            DATABASE ONLINE
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH */}
        {!loading && search.trim() !== "" && (
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              SEARCH QUERY
            </div>

            <div className="mt-1 text-xs font-medium">
              "{search}"
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

            <h2 className="mt-4 text-sm font-semibold">
              Loading repository
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Fetching approved scientific records
              from MongoDB.
            </p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <div
              key={document.id}
              onClick={() =>
                setSelectedId(document.id)
              }
              className="cursor-pointer"
            >
              <RepositoryRow item={document} />
            </div>
          ))
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <FileSearch className="h-5 w-5 stroke-[1.5] text-neutral-400" />

            <h2 className="mt-4 text-sm font-semibold">
              No matching records
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Try another search term or change your
              filter selections.
            </p>
          </div>
        )}
      </section>

      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument}
          onClose={() =>
            setSelectedId(null)
          }
        />
      )}
    </div>
  );
}

export default function RepositoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 sm:p-6">
          <section className="flex min-h-64 items-center justify-center border border-neutral-200">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

              <div className="mt-3 text-xs text-neutral-500">
                Loading repository...
              </div>
            </div>
          </section>
        </div>
      }
    >
      <RepositoryContent />
    </Suspense>
  );
}