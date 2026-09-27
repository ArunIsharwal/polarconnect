"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Database,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

import MetricCard from "@/components/dashboard/MetricCard";
import StatusIndicator from "@/components/dashboard/StatusIndicator";

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
  createdAt?: string;
  updatedAt?: string;
};

type DashboardDocument = {
  id: string;
  title: string;
  type: string;
  region: string;
  year: number;
  description: string;
  fileName: string;
  status: string;
  createdAt?: string;
};

export default function HomePage() {
  const [documents, setDocuments] = useState<
    DashboardDocument[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/documents", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load dashboard data",
          );
        }

        const apiDocuments: ApiDocument[] =
          Array.isArray(result.documents)
            ? result.documents
            : [];

        const mappedDocuments: DashboardDocument[] =
          apiDocuments.map((document) => ({
            id: String(document._id),
            title:
              document.title || "Untitled document",
            type:
              document.contentType || "REPORT",
            region:
              document.region || "ANTARCTICA",
            year: document.year || 0,
            description:
              document.description || "",
            fileName:
              document.fileName || "",
            status:
              document.status || "PENDING",
            createdAt:
              document.createdAt,
          }));

        setDocuments(mappedDocuments);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  const approvedDocuments = useMemo(() => {
    return documents.filter(
      (document) =>
        document.status.toUpperCase() === "APPROVED",
    );
  }, [documents]);

  const pendingDocuments = useMemo(() => {
    return documents.filter(
      (document) =>
        document.status.toUpperCase() === "PENDING",
    );
  }, [documents]);

  const reportCount = useMemo(() => {
    return documents.filter(
      (document) =>
        document.type.toUpperCase() === "REPORT",
    ).length;
  }, [documents]);

  const datasetCount = useMemo(() => {
    return documents.filter(
      (document) =>
        document.type.toUpperCase() === "DATASET",
    ).length;
  }, [documents]);

  const publicationCount = useMemo(() => {
    return documents.filter(
      (document) =>
        document.type.toUpperCase() ===
        "PUBLICATION",
    ).length;
  }, [documents]);

  const mediaCount = useMemo(() => {
    return documents.filter(
      (document) =>
        document.type.toUpperCase() === "MEDIA",
    ).length;
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return [...approvedDocuments]
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [approvedDocuments]);

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER / HERO */}
      <section className="grid border border-neutral-200 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
        <div className="border-b border-neutral-200 p-5 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              SYSTEM / POLAR KNOWLEDGE
            </span>

            <StatusIndicator
              label="LIVE"
              status="live"
            />
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            Polar science,
            <br />
            organized for discovery.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500">
            A unified knowledge repository for polar research,
            expedition records, datasets, publications and outreach
            media.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/repository"
              className="inline-flex h-9 items-center gap-2 rounded-sm bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Explore repository

              <ArrowUpRight className="h-4 w-4 stroke-[1.5]" />
            </Link>

            <Link
              href="/expeditions"
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50"
            >
              <FlaskConical className="h-4 w-4 stroke-[1.5]" />

              Research areas
            </Link>
          </div>
        </div>

        {/* LIVE METRICS */}
        <div className="grid grid-cols-2">
          <MetricCard
            label="Records"
            value={
              loading
                ? "..."
                : String(documents.length)
            }
            detail={
              loading
                ? "LOADING"
                : `${approvedDocuments.length} APPROVED`
            }
          />

          <MetricCard
            label="Datasets"
            value={
              loading
                ? "..."
                : String(datasetCount)
            }
            detail={
              loading
                ? "LOADING"
                : "MONGODB RECORDS"
            }
          />

          <MetricCard
            label="Expeditions"
            value="—"
            detail="SOURCE NOT CONNECTED"
          />

          <MetricCard
            label="Media"
            value={
              loading
                ? "..."
                : String(mediaCount)
            }
            detail={
              loading
                ? "LOADING"
                : "MONGODB RECORDS"
            }
          />
        </div>
      </section>

      {/* DATABASE STATUS */}
      {error && (
        <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* MAIN 70 / 30 */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
        {/* RECENT APPROVED RECORDS */}
        <section className="border border-neutral-200">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Repository
              </div>

              <h2 className="mt-1 text-base font-semibold tracking-tight">
                Recent approved records
              </h2>
            </div>

            <Link
              href="/repository"
              className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 hover:text-black"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

                <div className="mt-3 text-xs text-neutral-500">
                  Loading repository...
                </div>
              </div>
            </div>
          ) : recentDocuments.length > 0 ? (
            <div>
              {recentDocuments.map((document) => (
                <Link
                  key={document.id}
                  href="/repository"
                  className="block border-b border-neutral-200 px-4 py-4 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                          {document.type}
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                          {document.region}
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                          {document.year}
                        </span>
                      </div>

                      <h3 className="mt-2 text-sm font-semibold tracking-tight">
                        {document.title}
                      </h3>

                      {document.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                          {document.description}
                        </p>
                      )}

                      {document.fileName && (
                        <div className="mt-2 font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                          {document.fileName}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600">
                        APPROVED
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center px-6 text-center">
              <div>
                <Database className="mx-auto h-6 w-6 stroke-[1.5] text-neutral-400" />

                <h3 className="mt-4 text-sm font-semibold">
                  No approved records
                </h3>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Approved scientific documents will appear here.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* OPERATIONS */}
        <aside className="border border-neutral-200">
          <div className="border-b border-neutral-200 px-4 py-4">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Operations
            </div>

            <h2 className="mt-1 text-base font-semibold tracking-tight">
              Repository health
            </h2>
          </div>

          <HealthRow
            label="Database"
            value={
              loading
                ? "..."
                : error
                  ? "ERROR"
                  : "ONLINE"
            }
            detail={
              error
                ? "CHECK CONNECTION"
                : "MONGODB"
            }
          />

          <HealthRow
            label="Approved records"
            value={
              loading
                ? "..."
                : String(approvedDocuments.length)
            }
            detail="PUBLIC"
          />

          <HealthRow
            label="Pending review"
            value={
              loading
                ? "..."
                : String(pendingDocuments.length)
            }
            detail="ADMIN QUEUE"
          />

          <HealthRow
            label="Rejected records"
            value={
              loading
                ? "..."
                : String(
                    documents.filter(
                      (document) =>
                        document.status.toUpperCase() ===
                        "REJECTED",
                    ).length,
                  )
            }
            detail="NOT PUBLIC"
          />

          <div className="border-t border-neutral-200 px-4 py-5">
            <div className="flex gap-3">
              <ShieldCheck className="h-4 w-4 shrink-0 stroke-[1.5]" />

              <div>
                <div className="text-sm font-medium">
                  Verified knowledge
                </div>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Published records pass metadata and administrator
                  review before public discovery.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* CONTENT TYPE SUMMARY */}
      <section className="mt-4 border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Database Distribution
            </div>

            <h2 className="mt-1 text-base font-semibold">
              Scientific record types
            </h2>
          </div>

          <StatusIndicator
            label="LIVE"
            status="live"
          />
        </div>

        <div className="grid gap-px bg-neutral-200 md:grid-cols-4">
          <TypeSummary
            title="Reports"
            value={
              loading
                ? "..."
                : String(reportCount)
            }
          />

          <TypeSummary
            title="Datasets"
            value={
              loading
                ? "..."
                : String(datasetCount)
            }
          />

          <TypeSummary
            title="Publications"
            value={
              loading
                ? "..."
                : String(publicationCount)
            }
          />

          <TypeSummary
            title="Media"
            value={
              loading
                ? "..."
                : String(mediaCount)
            }
          />
        </div>
      </section>

      {/* PROCESSING QUEUE */}
      <section className="mt-4 border border-neutral-200">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Data Pipeline
            </div>

            <h2 className="mt-1 text-base font-semibold">
              Processing queue
            </h2>
          </div>

          <StatusIndicator
            label="Live"
            status="live"
          />
        </div>

        <div className="grid gap-px bg-neutral-200 md:grid-cols-3">
          <PipelineItem
            title="Uploaded records"
            value={
              loading
                ? "LOADING"
                : `${documents.length} RECORDS`
            }
          />

          <PipelineItem
            title="Metadata validation"
            value={
              loading
                ? "LOADING"
                : `${pendingDocuments.length} REVIEW`
            }
          />

          <PipelineItem
            title="Approved knowledge"
            value={
              loading
                ? "LOADING"
                : `${approvedDocuments.length} READY`
            }
          />
        </div>
      </section>

      {/* MISSION STRIP */}
      <section className="mt-4 grid border border-neutral-200 md:grid-cols-[1fr_auto]">
        <div className="p-5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Mission
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
            Make polar scientific knowledge discoverable, structured,
            searchable and easier to communicate to researchers,
            students and the public.
          </p>
        </div>

        <div className="flex items-center border-t border-neutral-200 px-5 py-4 md:border-l md:border-t-0">
          <Link
            href="/assistant"
            className="inline-flex h-9 items-center gap-2 font-mono text-[9px] uppercase tracking-widest hover:text-amber-600"
          >
            Ask the science assistant

            <ArrowUpRight className="h-3 w-3 stroke-[1.5]" />
          </Link>
        </div>
      </section>

      {/* SOURCE STATUS */}
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        <Database className="h-3 w-3 stroke-[1.5]" />

        <span>
          LIVE DATABASE / MONGODB
        </span>

        {!loading && !error && (
          <span>
            / {documents.length} TOTAL RECORDS
          </span>
        )}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
      <div>
        <div className="text-xs font-medium">
          {label}
        </div>

        <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {detail}
        </div>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-widest">
        {value}
      </div>
    </div>
  );
}

function TypeSummary({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="h-1.5 w-full bg-neutral-900" />

      <div className="mt-4 text-xs font-medium">
        {title}
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {value}
      </div>
    </div>
  );
}

function PipelineItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="h-1.5 w-full animate-pulse bg-neutral-900" />

      <div className="mt-4 text-xs font-medium">
        {title}
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {value}
      </div>
    </div>
  );
}