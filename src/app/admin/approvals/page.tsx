"use client";

import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  RefreshCw,
  Sparkles,
  X,
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

  aiSuggestedTags?: string[];

  aiTagsStatus?:
    | "NOT_STARTED"
    | "PROCESSING"
    | "COMPLETE"
    | "FAILED";

  aiTagsProcessedAt?: string;
};

export default function AdminApprovalsPage() {
  const [documents, setDocuments] = useState<
    DocumentItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState<
    string | null
  >(null);

  async function loadPendingDocuments() {
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

      const allDocuments: DocumentItem[] =
        Array.isArray(result.documents)
          ? result.documents
          : [];

      const pendingDocuments =
        allDocuments.filter(
          (document) =>
            (
              document.status ||
              "PENDING"
            ).toUpperCase() === "PENDING",
        );

      setDocuments(pendingDocuments);
    } catch (error) {
      console.error(
        "Approval queue loading error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load approval queue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingDocuments();
  }, []);

  async function updateDocument(
    id: string,
    body: {
      status?: "APPROVED" | "REJECTED";
      useAISuggestedTags?: boolean;
    },
  ) {
    try {
      setUpdatingId(id);
      setError("");

      const response = await fetch(
        `/api/documents/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update document",
        );
      }

      /*
       * If AI tags were accepted, keep the document
       * in the pending queue and update its tags locally.
       */
      if (
        body.useAISuggestedTags === true
      ) {
        setDocuments(
          (currentDocuments) =>
            currentDocuments.map(
              (document) =>
                document._id === id
                  ? {
                      ...document,
                      tags:
                        result.document
                          ?.tags ||
                        document.aiSuggestedTags ||
                        [],
                    }
                  : document,
            ),
        );
      }

      /*
       * Once approved or rejected, remove it
       * from the pending queue.
       */
      if (body.status) {
        setDocuments(
          (currentDocuments) =>
            currentDocuments.filter(
              (document) =>
                document._id !== id,
            ),
        );
      }
    } catch (error) {
      console.error(
        "Approval update error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update document.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <section className="border border-neutral-200">
        {/* HEADER */}
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            ADMIN / APPROVAL QUEUE
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Content Approval
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Review uploaded scientific records,
                inspect AI suggestions and approve or reject
                them before public discovery.
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadPendingDocuments
              }
              disabled={loading}
              className="inline-flex h-9 items-center justify-center gap-2 border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 stroke-[1.5] ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {loading
              ? "LOADING QUEUE..."
              : `${documents.length} PENDING RECORDS`}
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            <span className="h-1 w-1 animate-pulse bg-amber-500" />

            REVIEW QUEUE
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
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

            <h2 className="mt-4 text-sm font-semibold">
              Loading approval queue
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              Fetching pending records from MongoDB.
            </p>
          </div>
        ) : documents.length === 0 ? (
          /* EMPTY QUEUE */
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <Check className="h-6 w-6 stroke-[1.5] text-emerald-600" />

            <h2 className="mt-4 text-sm font-semibold">
              Approval queue is empty
            </h2>

            <p className="mt-1 text-xs text-neutral-500">
              There are no pending scientific records
              waiting for review.
            </p>
          </div>
        ) : (
          /* PENDING DOCUMENTS */
          <div>
            <div className="grid grid-cols-[1fr_auto] border-b border-neutral-200 px-4 py-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                RECORD
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                ACTIONS
              </span>
            </div>

            {documents.map((document) => {
              const isUpdating =
                updatingId ===
                document._id;

              const aiTags =
                Array.isArray(
                  document.aiSuggestedTags,
                )
                  ? document.aiSuggestedTags
                  : [];

              const currentTags =
                Array.isArray(
                  document.tags,
                )
                  ? document.tags
                  : [];

              const aiComplete =
                document.aiTagsStatus ===
                "COMPLETE";

              return (
                <div
                  key={document._id}
                  className="border-b border-neutral-200 px-4 py-5 last:border-b-0"
                >
                  <div className="flex flex-col gap-6">
                    {/* DOCUMENT */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-neutral-200">
                        <FileText className="h-4 w-4 stroke-[1.5] text-neutral-500" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                          {document.contentType ||
                            "REPORT"}{" "}
                          /{" "}
                          {document.region ||
                            "ANTARCTICA"}{" "}
                          /{" "}
                          {document.year ||
                            "—"}
                        </div>

                        <h2 className="mt-1 text-sm font-semibold">
                          {document.title}
                        </h2>

                        {document.fileName && (
                          <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                            {document.fileName}
                          </p>
                        )}

                        {document.description && (
                          <p className="mt-2 max-w-3xl text-xs leading-5 text-neutral-500">
                            {document.description}
                          </p>
                        )}

                        {/* CURRENT TAGS */}
                        {currentTags.length >
                          0 && (
                          <div className="mt-3">
                            <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                              Current tags
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {currentTags.map(
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
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI TAGS */}
                    <div className="border border-neutral-200">
                      <div className="flex flex-col justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 stroke-[1.5]" />

                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                              AI SUGGESTIONS
                            </div>

                            <div className="mt-1 text-xs font-semibold">
                              Suggested keywords
                            </div>
                          </div>
                        </div>

                        <div
                          className={`font-mono text-[9px] uppercase tracking-widest ${
                            aiComplete
                              ? "text-emerald-600"
                              : document.aiTagsStatus ===
                                  "PROCESSING"
                                ? "text-amber-600"
                                : document.aiTagsStatus ===
                                    "FAILED"
                                  ? "text-red-600"
                                  : "text-neutral-500"
                          }`}
                        >
                          {document.aiTagsStatus ||
                            "NOT STARTED"}
                        </div>
                      </div>

                      <div className="p-4">
                        {aiTags.length >
                        0 ? (
                          <div className="flex flex-wrap gap-2">
                            {aiTags.map(
                              (tag) => (
                                <span
                                  key={tag}
                                  className="border border-neutral-300 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600"
                                >
                                  {tag}
                                </span>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-xs leading-5 text-neutral-500">
                            No AI suggested tags are
                            available yet.
                          </p>
                        )}

                        {aiTags.length >
                          0 && (
                          <button
                            type="button"
                            disabled={
                              isUpdating ||
                              !aiComplete
                            }
                            onClick={() =>
                              updateDocument(
                                document._id,
                                {
                                  useAISuggestedTags:
                                    true,
                                },
                              )
                            }
                            className="mt-4 inline-flex h-9 items-center gap-2 border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Sparkles className="h-4 w-4 stroke-[1.5]" />

                            {isUpdating
                              ? "Saving..."
                              : "Use AI tags"}
                          </button>
                        )}

                        <p className="mt-3 text-[10px] leading-5 text-neutral-500">
                          AI suggestions are advisory. Review them
                          before using them as final metadata.
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={
                          isUpdating
                        }
                        onClick={() =>
                          updateDocument(
                            document._id,
                            {
                              status:
                                "APPROVED",
                            },
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-sm bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        <Check className="h-4 w-4 stroke-[1.5]" />

                        {isUpdating
                          ? "Updating..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          isUpdating
                        }
                        onClick={() =>
                          updateDocument(
                            document._id,
                            {
                              status:
                                "REJECTED",
                            },
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-sm border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-4 w-4 stroke-[1.5]" />

                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}