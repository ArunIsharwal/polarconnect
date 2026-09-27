"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileImage,
  FileSearch,
  Image as ImageIcon,
  Play,
  Video,
} from "lucide-react";

type MediaDocument = {
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

export default function MediaPage() {
  const [documents, setDocuments] = useState<
    MediaDocument[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  useEffect(() => {
    async function loadMedia() {
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

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load media",
          );
        }

        const allDocuments: MediaDocument[] =
          Array.isArray(
            result.documents,
          )
            ? result.documents
            : [];

        const approvedMedia =
          allDocuments.filter(
            (document) =>
              (
                document.status || ""
              ).toUpperCase() ===
                "APPROVED" &&
              (
                document.contentType ||
                ""
              ).toUpperCase() ===
                "MEDIA",
          );

        setDocuments(
          approvedMedia,
        );
      } catch (error) {
        console.error(
          "Media loading error:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load media.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, []);

  const mediaItems =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return documents.filter(
        (media) => {
          const matchesSearch =
            !searchValue ||
            media.title
              .toLowerCase()
              .includes(searchValue) ||
            (
              media.description ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              media.region ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              media.fileName ||
              ""
            )
              .toLowerCase()
              .includes(searchValue) ||
            (
              media.tags || []
            ).some((tag) =>
              tag
                .toLowerCase()
                .includes(
                  searchValue,
                ),
            );

          const matchesFilter =
            filter === "ALL" ||
            getMediaKind(
              media.fileName ||
                "",
            ) === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      documents,
      search,
      filter,
    ]);

  return (
    <div className="p-4 sm:p-6">
      <section className="border border-neutral-200">
        {/* HEADER */}
        <div className="border-b border-neutral-200 p-5 sm:p-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            MEDIA / POLAR ARCHIVE
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Media
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Explore approved polar photographs,
                videos and outreach media stored in the
                PolarConnect repository.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />
              DATABASE ONLINE
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="grid border-b border-neutral-200 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="p-4">
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Search media
            </label>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search title, region, tags or filename..."
              className="mt-2 h-10 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="border-t border-neutral-200 p-4 md:border-l md:border-t-0">
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Media type
            </label>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value,
                )
              }
              className="mt-2 h-10 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-black"
            >
              <option value="ALL">
                ALL
              </option>

              <option value="IMAGE">
                IMAGE
              </option>

              <option value="VIDEO">
                VIDEO
              </option>
            </select>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {loading
              ? "LOADING MEDIA..."
              : `${mediaItems.length} MEDIA RECORDS FOUND`}
          </div>

          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            APPROVED ONLY
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
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />

              <p className="mt-3 text-xs text-neutral-500">
                Loading approved media...
              </p>
            </div>
          </div>
        ) : mediaItems.length ===
          0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <FileSearch className="h-6 w-6 stroke-[1.5] text-neutral-400" />

            <h2 className="mt-4 text-sm font-semibold">
              No media found
            </h2>

            <p className="mt-1 max-w-md text-xs leading-5 text-neutral-500">
              {documents.length === 0
                ? "There are currently no approved MEDIA records in the repository."
                : "Try another search term or media type."}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_100px_190px] gap-4 border-b border-neutral-200 px-4 py-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                MEDIA RECORD
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                YEAR
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                ACTIONS
              </span>
            </div>

            {mediaItems.map(
              (media) => (
                <MediaRow
                  key={media._id}
                  media={media}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function MediaRow({
  media,
}: {
  media: MediaDocument;
}) {
  const kind =
    getMediaKind(
      media.fileName || "",
    );

  const isImage =
    kind === "IMAGE";

  const isVideo =
    kind === "VIDEO";

  return (
    <article className="border-b border-neutral-200 px-4 py-5 last:border-b-0 hover:bg-neutral-50">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_100px_190px] md:items-start">
        {/* INFO */}
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-200 bg-white">
            {isImage ? (
              <ImageIcon className="h-4 w-4 stroke-[1.5] text-neutral-500" />
            ) : isVideo ? (
              <Video className="h-4 w-4 stroke-[1.5] text-neutral-500" />
            ) : (
              <FileImage className="h-4 w-4 stroke-[1.5] text-neutral-500" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                MEDIA
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                {kind}
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                {media.region ||
                  "UNKNOWN"}
              </span>

              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600">
                APPROVED
              </span>
            </div>

            <h2 className="mt-2 text-sm font-semibold tracking-tight">
              {media.title}
            </h2>

            {media.fileName && (
              <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                {media.fileName}
              </div>
            )}

            <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-500">
              {media.description ||
                "No description available."}
            </p>

            {media.tags &&
              media.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {media.tags.map(
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
        </div>

        {/* YEAR */}
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400 md:hidden">
            YEAR
          </div>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600 md:mt-0">
            {media.year ||
              "—"}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2">
          {media.fileUrl &&
            isVideo && (
              <a
                href={
                  media.fileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-2 border border-neutral-200 px-3 text-[10px] font-medium hover:bg-white"
              >
                <Play className="h-3.5 w-3.5 stroke-[1.5]" />
                Play
              </a>
            )}

          {media.fileUrl && (
            <a
              href={
                media.fileUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-2 border border-neutral-200 px-3 text-[10px] font-medium hover:bg-white"
            >
              <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
              Open
            </a>
          )}

          {media.fileUrl && (
            <a
              href={
                media.fileUrl
              }
              download={
                media.fileName ||
                true
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

function getMediaKind(
  fileName: string,
) {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "gif" ||
    extension === "webp"
  ) {
    return "IMAGE";
  }

  if (
    extension === "mp4" ||
    extension === "mov" ||
    extension === "webm"
  ) {
    return "VIDEO";
  }

  return "FILE";
}