"use client";

import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";

type DocumentItem = {
  _id?: string;
  id?: string;

  title: string;

  contentType?: string;

  region?: string;

  year?: number;

  description?: string;

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
};

export default function AdminAIPage() {
  const [documents, setDocuments] =
    useState<DocumentItem[]>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/documents",
          {
            cache: "no-store",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Failed to load documents.",
        );
      }

      const data =
        (await response.json()) as
          | DocumentItem[]
          | {
              documents?: DocumentItem[];
            };

      const items =
        Array.isArray(data)
          ? data
          : data.documents ?? [];

      setDocuments(items);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load documents.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function generateSummary(
    documentId: string,
  ) {
    setDocuments(
      (current) =>
        current.map((document) => {
          const currentId =
            document._id ??
            document.id;

          if (
            currentId !==
            documentId
          ) {
            return document;
          }

          return {
            ...document,
            aiStatus:
              "PROCESSING",
          };
        }),
    );

    try {
      const response =
        await fetch(
          "/api/ai/summarize",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials:
              "include",
            body: JSON.stringify({
              documentId,
            }),
          },
        );

      const result =
        (await response.json()) as {
          success?: boolean;
          message?: string;
          aiSummary?: string;
          aiStatus?:
            | "NOT_STARTED"
            | "PROCESSING"
            | "COMPLETE"
            | "FAILED";
        };

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "AI summary generation failed.",
        );
      }

      setDocuments(
        (current) =>
          current.map(
            (document) => {
              const currentId =
                document._id ??
                document.id;

              if (
                currentId !==
                documentId
              ) {
                return document;
              }

              return {
                ...document,
                aiStatus:
                  "COMPLETE",
                aiSummary:
                  result.aiSummary ||
                  "",
                aiProcessedAt:
                  new Date().toISOString(),
              };
            },
          ),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI summary generation failed.";

      setDocuments(
        (current) =>
          current.map(
            (document) => {
              const currentId =
                document._id ??
                document.id;

              if (
                currentId !==
                documentId
              ) {
                return document;
              }

              return {
                ...document,
                aiStatus:
                  "FAILED",
              };
            },
          ),
      );

      window.alert(
        message,
      );
    }
  }

  const approvedDocuments =
    documents.filter(
      (document) =>
        document.status ===
          "APPROVED" ||
        document.status ===
          "PUBLISHED",
    );

  return (
    <main className="min-h-screen">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          ADMIN / AI PROCESSING
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          AI document processing
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Generate AI summaries directly from PDFs
          stored in Vercel Blob. Only authenticated
          administrators can run AI processing.
        </p>
      </div>

      <div className="p-6">
        {loading && (
          <div className="border border-neutral-200 px-4 py-8 text-sm text-neutral-500">
            Loading approved documents...
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          approvedDocuments.length ===
            0 && (
            <div className="border border-neutral-200 px-4 py-10 text-center">
              <FileText className="mx-auto h-7 w-7 stroke-[1.5] text-neutral-400" />

              <div className="mt-3 text-sm font-medium">
                No approved documents
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Approve a document first.
              </p>
            </div>
          )}

        <div className="grid gap-4">
          {approvedDocuments.map(
            (document) => {
              const documentId =
                document._id ??
                document.id ??
                "";

              const aiStatus =
                document.aiStatus ??
                "NOT_STARTED";

              const isProcessing =
                aiStatus ===
                "PROCESSING";

              const isComplete =
                aiStatus ===
                "COMPLETE";

              return (
                <section
                  key={
                    documentId
                  }
                  className="border border-neutral-200"
                >
                  <div className="flex flex-col gap-4 border-b border-neutral-200 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        {document.contentType ??
                          "DOCUMENT"}{" "}
                        /{" "}
                        {document.region ??
                          "UNKNOWN"}{" "}
                        /{" "}
                        {document.year ??
                          "—"}
                      </div>

                      <h2 className="mt-1 text-base font-semibold">
                        {
                          document.title
                        }
                      </h2>

                      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        {document.fileName ??
                          "PDF"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-[9px] uppercase tracking-widest ${
                          isComplete
                            ? "text-emerald-600"
                            : isProcessing
                              ? "text-amber-600"
                              : aiStatus ===
                                  "FAILED"
                                ? "text-red-600"
                                : "text-neutral-500"
                        }`}
                      >
                        {aiStatus}
                      </span>

                      <button
                        type="button"
                        disabled={
                          isProcessing
                        }
                        onClick={() =>
                          void generateSummary(
                            documentId,
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 stroke-[1.5]" />
                            {isComplete
                              ? "Regenerate Summary"
                              : "Generate AI Summary"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {document.description && (
                    <div className="border-b border-neutral-200 px-4 py-4">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        Description
                      </div>

                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        {
                          document.description
                        }
                      </p>
                    </div>
                  )}

                  <div className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 stroke-[1.5]" />

                      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                        SCIENTIFIC SUMMARY
                      </div>
                    </div>

                    {isProcessing && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                        <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
                        AI is reading the PDF and
                        generating the summary...
                      </div>
                    )}

                    {aiStatus ===
                      "FAILED" && (
                      <div className="mt-4 flex gap-2 border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
                        <XCircle className="h-4 w-4 shrink-0 stroke-[1.5]" />
                        Previous AI attempt failed.
                        Press Generate AI Summary
                        to retry.
                      </div>
                    )}

                    {isComplete &&
                      document.aiSummary && (
                        <div className="mt-4 border border-neutral-200 bg-neutral-50 px-4 py-4">
                          <p className="text-sm leading-7 text-neutral-700">
                            {
                              document.aiSummary
                            }
                          </p>

                          {document.aiProcessedAt && (
                            <div className="mt-4 border-t border-neutral-200 pt-3 font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                              AI PROCESSED /{" "}
                              {new Date(
                                document.aiProcessedAt,
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                    {!isProcessing &&
                      !isComplete &&
                      aiStatus !==
                        "FAILED" && (
                        <p className="mt-4 text-xs text-neutral-500">
                          No AI summary generated
                          yet.
                        </p>
                      )}
                  </div>

                  {isComplete && (
                    <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <Check className="h-4 w-4 stroke-[1.5]" />
                        AI summary saved to MongoDB.
                      </div>
                    </div>
                  )}
                </section>
              );
            },
          )}
        </div>
      </div>
    </main>
  );
}