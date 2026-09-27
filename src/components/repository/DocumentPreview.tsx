"use client";

import {
  Download,
  ExternalLink,
  FileText,
  Sparkles,
  X,
} from "lucide-react";

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

  author?: string;

  organization?: string;
};

type DocumentPreviewProps = {
  document: RepositoryDocument;

  onClose: () => void;
};

function getFileFormat(
  fileName: string,
  type: string,
) {
  if (fileName) {
    const extension =
      fileName
        .split(".")
        .pop()
        ?.toUpperCase();

    if (extension) {
      return extension;
    }
  }

  return type;
}

export default function DocumentPreview({
  document,
  onClose,
}: DocumentPreviewProps) {
  const format =
    getFileFormat(
      document.fileName,
      document.type,
    );

  const isPdf =
    document.fileName
      .toLowerCase()
      .endsWith(".pdf");

  const aiStatusLabel =
    document.aiStatus ===
    "COMPLETE"
      ? "COMPLETE"
      : document.aiStatus ===
        "PROCESSING"
        ? "PROCESSING"
        : document.aiStatus ===
          "FAILED"
          ? "FAILED"
          : "NOT STARTED";

  const aiStatusClass =
    document.aiStatus ===
    "COMPLETE"
      ? "text-emerald-600"
      : document.aiStatus ===
        "PROCESSING"
        ? "text-amber-600"
        : document.aiStatus ===
          "FAILED"
          ? "text-red-600"
          : "text-neutral-500";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full max-w-6xl flex-col border border-neutral-300 bg-white"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              DOCUMENT /{" "}
              {document.id}
            </div>

            <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
              {
                document.title
              }
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 hover:bg-neutral-50"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>
        </header>

        {/* MAIN */}
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* LEFT */}
          <div className="min-h-0 overflow-auto p-4 sm:p-6">
            {/* PDF */}
            {document.fileUrl ? (
              <div className="flex min-h-[520px] flex-col border border-neutral-200">
                {isPdf ? (
                  <iframe
                    src={
                      document.fileUrl
                    }
                    title={
                      document.title
                    }
                    className="min-h-[520px] w-full flex-1"
                  />
                ) : (
                  <div className="flex min-h-[520px] flex-col items-center justify-center bg-neutral-50 px-6 text-center">
                    <FileText className="h-8 w-8 stroke-[1.5] text-neutral-400" />

                    <div className="mt-4 text-sm font-medium">
                      Preview not available
                    </div>

                    <div className="mt-2 max-w-md text-xs leading-5 text-neutral-500">
                      Browser preview is
                      currently available
                      only for PDF
                      documents.
                    </div>

                    <a
                      href={
                        document.fileUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex h-9 items-center gap-2 bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800"
                    >
                      <ExternalLink className="h-4 w-4 stroke-[1.5]" />
                      Open file
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[520px] flex-col items-center justify-center border border-neutral-200 bg-neutral-50 px-6 text-center">
                <FileText className="h-8 w-8 stroke-[1.5] text-neutral-400" />

                <div className="mt-4 text-sm font-medium">
                  File unavailable
                </div>

                <div className="mt-2 max-w-md text-xs leading-5 text-neutral-500">
                  This record has
                  metadata, but no file URL
                  is currently stored.
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            <div className="mt-6">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Description
              </div>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {document.description ||
                  "No description available."}
              </p>
            </div>

            {/* AI SUMMARY */}
            <section className="mt-6 border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 stroke-[1.5]" />

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      AI ANALYSIS
                    </div>

                    <h3 className="mt-1 text-sm font-semibold">
                      Scientific summary
                    </h3>
                  </div>
                </div>

                <div
                  className={`font-mono text-[9px] uppercase tracking-widest ${aiStatusClass}`}
                >
                  {
                    aiStatusLabel
                  }
                </div>
              </div>

              <div className="p-4">
                {document.aiStatus ===
                  "COMPLETE" &&
                document.aiSummary ? (
                  <>
                    <p className="text-sm leading-7 text-neutral-700">
                      {
                        document.aiSummary
                      }
                    </p>

                    {document.aiProcessedAt && (
                      <div className="mt-4 border-t border-neutral-100 pt-3 font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                        AI PROCESSED /{" "}
                        {new Date(
                          document.aiProcessedAt,
                        ).toLocaleString()}
                      </div>
                    )}
                  </>
                ) : document.aiStatus ===
                  "PROCESSING" ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-black" />

                    AI processing is
                    currently in progress.
                  </div>
                ) : document.aiStatus ===
                  "FAILED" ? (
                  <div>
                    <p className="text-xs leading-5 text-red-600">
                      AI processing failed.
                      An administrator can
                      retry the AI processing
                      from the Admin AI console.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-neutral-500">
                    No AI summary has been
                    generated for this document
                    yet.
                  </p>
                )}
              </div>

              <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
                <p className="text-[10px] leading-5 text-neutral-500">
                  AI-generated text is
                  provided as an assistive
                  summary. Verify important
                  scientific values against the
                  original document.
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="min-h-0 overflow-auto border-t border-neutral-200 lg:border-l lg:border-t-0">
            <Metadata
              label="Document type"
              value={
                document.type
              }
            />

            <Metadata
              label="Region"
              value={
                document.region
              }
            />

            <Metadata
              label="Year"
              value={String(
                document.year,
              )}
            />

            <Metadata
              label="Format"
              value={format}
            />

            <Metadata
              label="Status"
              value={
                document.status
              }
            />

            <Metadata
              label="AI status"
              value={
                aiStatusLabel
              }
            />

            <Metadata
              label="File"
              value={
                document.fileName ||
                "Not available"
              }
            />

            <Metadata
              label="Author"
              value={
                document.author ||
                "Not specified"
              }
            />

            <Metadata
              label="Organization"
              value={
                document.organization ||
                "Not specified"
              }
            />

            {/* TAGS */}
            <div className="border-t border-neutral-200 p-4">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Tags
              </div>

              {document.tags
                .length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {document.tags.map(
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
              ) : (
                <div className="mt-3 text-xs text-neutral-500">
                  No tags available.
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="border-t border-neutral-200 p-4">
              <div className="grid gap-2">
                {document.fileUrl && (
                  <a
                    href={
                      document.fileUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-full items-center justify-center gap-2 bg-black text-xs font-medium text-white hover:bg-neutral-800"
                  >
                    <ExternalLink className="h-4 w-4 stroke-[1.5]" />
                    Open PDF
                  </a>
                )}

                {document.fileUrl && (
                  <a
                    href={
                      document.fileUrl
                    }
                    download={
                      document.fileName ||
                      true
                    }
                    className="inline-flex h-9 w-full items-center justify-center gap-2 border border-neutral-200 text-xs font-medium hover:bg-neutral-50"
                  >
                    <Download className="h-4 w-4 stroke-[1.5]" />
                    Download record
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metadata({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-neutral-200 p-4">
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="mt-2 break-words text-xs font-medium">
        {value}
      </div>
    </div>
  );
}