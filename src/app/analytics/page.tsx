"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Image,
  Sparkles,
  XCircle,
} from "lucide-react";

type DocumentItem = {
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

  aiSuggestedTags?: string[];

  aiTagsStatus?:
    | "NOT_STARTED"
    | "PROCESSING"
    | "COMPLETE"
    | "FAILED";

  createdAt?: string;
  updatedAt?: string;
};

type AnalyticsData = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;

  reports: number;
  datasets: number;
  publications: number;
  media: number;

  aiComplete: number;
  aiProcessing: number;
  aiFailed: number;
  aiNotStarted: number;
};

const EMPTY_ANALYTICS: AnalyticsData = {
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0,

  reports: 0,
  datasets: 0,
  publications: 0,
  media: 0,

  aiComplete: 0,
  aiProcessing: 0,
  aiFailed: 0,
  aiNotStarted: 0,
};

export default function AnalyticsPage() {
  const [documents, setDocuments] = useState<
    DocumentItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
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
              "Failed to load analytics data",
          );
        }

        const records: DocumentItem[] =
          Array.isArray(result.documents)
            ? result.documents
            : [];

        setDocuments(records);
      } catch (error) {
        console.error(
          "Analytics loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load analytics.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    return documents.reduce<AnalyticsData>(
      (stats, document) => {
        const status = (
          document.status || "PENDING"
        ).toUpperCase();

        const type = (
          document.contentType || "REPORT"
        ).toUpperCase();

        const aiStatus =
          document.aiStatus ||
          "NOT_STARTED";

        stats.total += 1;

        // Status
        if (status === "APPROVED") {
          stats.approved += 1;
        } else if (status === "REJECTED") {
          stats.rejected += 1;
        } else {
          stats.pending += 1;
        }

        // Content type
        if (type === "REPORT") {
          stats.reports += 1;
        } else if (type === "DATASET") {
          stats.datasets += 1;
        } else if (type === "PUBLICATION") {
          stats.publications += 1;
        } else if (type === "MEDIA") {
          stats.media += 1;
        }

        // AI
        if (aiStatus === "COMPLETE") {
          stats.aiComplete += 1;
        } else if (aiStatus === "PROCESSING") {
          stats.aiProcessing += 1;
        } else if (aiStatus === "FAILED") {
          stats.aiFailed += 1;
        } else {
          stats.aiNotStarted += 1;
        }

        return stats;
      },
      { ...EMPTY_ANALYTICS },
    );
  }, [documents]);

  const regions = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const document of documents) {
      const region =
        document.region?.trim() ||
        "UNKNOWN";

      counts[region] =
        (counts[region] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [documents]);

  const years = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const document of documents) {
      const year = document.year
        ? String(document.year)
        : "UNKNOWN";

      counts[year] =
        (counts[year] || 0) + 1;
    }

    return Object.entries(counts)
      .sort(
        (a, b) =>
          Number(b[0]) - Number(a[0]),
      )
      .slice(0, 8);
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bTime - aTime;
      })
      .slice(0, 6);
  }, [documents]);

  const approvalRate =
    analytics.total > 0
      ? Math.round(
          (analytics.approved /
            analytics.total) *
            100,
        )
      : 0;

  const aiCompletionRate =
    analytics.total > 0
      ? Math.round(
          (analytics.aiComplete /
            analytics.total) *
            100,
        )
      : 0;

  const maxRegionCount =
    regions.length > 0
      ? Math.max(
          ...regions.map(
            ([, count]) => count,
          ),
        )
      : 1;

  const maxYearCount =
    years.length > 0
      ? Math.max(
          ...years.map(
            ([, count]) => count,
          ),
        )
      : 1;

  return (
    <div className="p-4 sm:p-6">
      {/* HEADER */}
      <section className="border border-neutral-200">
        <div className="flex flex-col justify-between gap-5 border-b border-neutral-200 p-5 sm:flex-row sm:items-end sm:p-6">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              ANALYTICS / PORTAL TELEMETRY
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Analytics
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              Repository status, content distribution and AI
              processing metrics from the live PolarConnect
              database.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />
            LIVE DATABASE
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

              <div className="mt-3 text-xs text-neutral-500">
                Loading analytics...
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* KPI GRID */}
            <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total records"
                value={analytics.total}
                detail="ALL DATABASE RECORDS"
                icon={Database}
              />

              <MetricCard
                label="Approved"
                value={analytics.approved}
                detail={`${approvalRate}% APPROVAL RATE`}
                icon={CheckCircle2}
              />

              <MetricCard
                label="Pending"
                value={analytics.pending}
                detail="AWAITING REVIEW"
                icon={Clock3}
              />

              <MetricCard
                label="Rejected"
                value={analytics.rejected}
                detail="NOT PUBLISHED"
                icon={XCircle}
              />
            </div>
          </>
        )}
      </section>

      {!loading && (
        <>
          {/* CONTENT TYPES */}
          <section className="mt-4 border border-neutral-200">
            <div className="border-b border-neutral-200 px-4 py-4">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                DATABASE DISTRIBUTION
              </div>

              <h2 className="mt-1 text-base font-semibold">
                Scientific record types
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-2 xl:grid-cols-4">
              <TypeCard
                label="Reports"
                value={analytics.reports}
                icon={FileText}
                total={analytics.total}
              />

              <TypeCard
                label="Datasets"
                value={analytics.datasets}
                icon={Database}
                total={analytics.total}
              />

              <TypeCard
                label="Publications"
                value={
                  analytics.publications
                }
                icon={FileText}
                total={analytics.total}
              />

              <TypeCard
                label="Media"
                value={analytics.media}
                icon={Image}
                total={analytics.total}
              />
            </div>
          </section>

          {/* REGION + YEAR */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className="border border-neutral-200">
              <div className="border-b border-neutral-200 px-4 py-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  GEOGRAPHIC DISTRIBUTION
                </div>

                <h2 className="mt-1 text-base font-semibold">
                  Records by region
                </h2>
              </div>

              <div className="p-4">
                {regions.length === 0 ? (
                  <EmptyAnalyticsState text="No regional data available." />
                ) : (
                  <div className="space-y-4">
                    {regions.map(
                      ([region, count]) => (
                        <DistributionRow
                          key={region}
                          label={region}
                          value={count}
                          max={maxRegionCount}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="border border-neutral-200">
              <div className="border-b border-neutral-200 px-4 py-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  TIME DISTRIBUTION
                </div>

                <h2 className="mt-1 text-base font-semibold">
                  Records by year
                </h2>
              </div>

              <div className="p-4">
                {years.length === 0 ? (
                  <EmptyAnalyticsState text="No year data available." />
                ) : (
                  <div className="space-y-4">
                    {years.map(
                      ([year, count]) => (
                        <DistributionRow
                          key={year}
                          label={year}
                          value={count}
                          max={maxYearCount}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* AI + STATUS */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <section className="border border-neutral-200">
              <div className="border-b border-neutral-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 stroke-[1.5]" />

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      AI PIPELINE
                    </div>

                    <h2 className="mt-1 text-base font-semibold">
                      Processing status
                    </h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-4">
                <StatusMetric
                  label="Complete"
                  value={analytics.aiComplete}
                />

                <StatusMetric
                  label="Processing"
                  value={
                    analytics.aiProcessing
                  }
                />

                <StatusMetric
                  label="Failed"
                  value={analytics.aiFailed}
                />

                <StatusMetric
                  label="Not started"
                  value={
                    analytics.aiNotStarted
                  }
                />
              </div>

              <div className="border-t border-neutral-200 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    AI COMPLETION
                  </span>

                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    {aiCompletionRate}%
                  </span>
                </div>

                <div className="mt-3 h-1.5 w-full bg-neutral-200">
                  <div
                    className="h-full bg-black transition-all"
                    style={{
                      width: `${aiCompletionRate}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="border border-neutral-200">
              <div className="border-b border-neutral-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 stroke-[1.5]" />

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      SYSTEM
                    </div>

                    <h2 className="mt-1 text-base font-semibold">
                      Repository health
                    </h2>
                  </div>
                </div>
              </div>

              <HealthRow
                label="Database"
                value="CONNECTED"
              />

              <HealthRow
                label="Repository"
                value={
                  analytics.total > 0
                    ? "ACTIVE"
                    : "EMPTY"
                }
              />

              <HealthRow
                label="Approval queue"
                value={`${analytics.pending} PENDING`}
              />

              <HealthRow
                label="AI engine"
                value={
                  analytics.aiFailed > 0
                    ? "ATTENTION"
                    : "OPERATIONAL"
                }
              />
            </section>
          </div>

          {/* RECENT RECORDS */}
          <section className="mt-4 border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  RECENT ACTIVITY
                </div>

                <h2 className="mt-1 text-base font-semibold">
                  Latest repository records
                </h2>
              </div>

              <BarChart3 className="h-4 w-4 stroke-[1.5] text-neutral-400" />
            </div>

            {recentDocuments.length === 0 ? (
              <EmptyAnalyticsState text="No repository records are available." />
            ) : (
              <div>
                {recentDocuments.map(
                  (document) => (
                    <div
                      key={document._id}
                      className="grid gap-3 border-b border-neutral-200 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                            {document.contentType ||
                              "REPORT"}
                          </span>

                          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                            {document.region ||
                              "UNKNOWN"}
                          </span>

                          {document.year && (
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                              {document.year}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 truncate text-sm font-semibold">
                          {document.title}
                        </div>

                        {document.fileName && (
                          <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                            {document.fileName}
                          </div>
                        )}
                      </div>

                      <StatusBadge
                        status={
                          document.status ||
                          "PENDING"
                        }
                      />

                      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 sm:text-right">
                        {document.createdAt
                          ? formatDate(
                              document.createdAt,
                            )
                          : "—"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* FOOTER NOTE */}
          <div className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            <Database className="h-3 w-3 stroke-[1.5]" />
            LIVE METRICS / MONGODB DOCUMENT INDEX
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {label}
        </div>

        <Icon className="h-4 w-4 stroke-[1.5] text-neutral-400" />
      </div>

      <div className="mt-4 text-3xl font-bold tracking-tight">
        {value.toLocaleString()}
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {detail}
      </div>
    </div>
  );
}

function TypeCard({
  label,
  value,
  icon: Icon,
  total,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100,
        )
      : 0;

  return (
    <div className="bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {label}
        </div>

        <Icon className="h-4 w-4 stroke-[1.5] text-neutral-400" />
      </div>

      <div className="mt-4 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-3 h-1.5 w-full bg-neutral-200">
        <div
          className="h-full bg-black"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {percentage}% OF RECORDS
      </div>
    </div>
  );
}

function StatusMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white p-4">
      <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="mt-3 text-xl font-bold">
        {value}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 last:border-b-0">
      <div className="text-xs font-medium">
        {label}
      </div>

      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
        {value}
      </div>
    </div>
  );
}

function DistributionRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage =
    max > 0
      ? Math.round(
          (value / max) * 100,
        )
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          {label}
        </span>

        <span className="font-mono text-[9px] uppercase tracking-widest">
          {value}
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full bg-neutral-200">
        <div
          className="h-full bg-black"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toUpperCase();

  const className =
    normalized === "APPROVED"
      ? "text-emerald-600"
      : normalized === "REJECTED"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <div
      className={`font-mono text-[9px] uppercase tracking-widest ${className}`}
    >
      {normalized}
    </div>
  );
}

function EmptyAnalyticsState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center px-6 text-center">
      <p className="text-xs text-neutral-500">
        {text}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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