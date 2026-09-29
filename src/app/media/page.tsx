"use client";

import {
  Image as ImageIcon,
  Search,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MediaDocument = {
  _id?: string;
  id?: string;

  title: string;
  region?: string;
  year?: number;
  description?: string;
  tags?: string[];
  fileName?: string;
  fileUrl?: string;
  status?: string;
};

type MediaFilter =
  | "ALL"
  | "IMAGE"
  | "VIDEO";

function getMediaType(
  fileName: string,
): "IMAGE" | "VIDEO" | "OTHER" {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    ["png", "jpg", "jpeg", "webp"].includes(
      extension || "",
    )
  ) {
    return "IMAGE";
  }

  if (
    ["mp4", "mov", "webm"].includes(
      extension || "",
    )
  ) {
    return "VIDEO";
  }

  return "OTHER";
}

export default function MediaPage() {
  const [documents, setDocuments] =
    useState<MediaDocument[]>(
      [],
    );

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<MediaFilter>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadMedia() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/documents",
            {
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load media.",
          );
        }

        const data =
          (await response.json()) as
            | MediaDocument[]
            | {
                documents?: MediaDocument[];
              };

        const records =
          Array.isArray(data)
            ? data
            : data.documents ?? [];

        setDocuments(
          records.filter(
            (document) =>
              document.status ===
                "APPROVED" &&
              document.fileUrl &&
              document.fileName &&
              getMediaType(
                document.fileName,
              ) !== "OTHER",
          ),
        );
      } catch (loadError) {
        setError(
          loadError instanceof
            Error
            ? loadError.message
            : "Failed to load media.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadMedia();
  }, []);

  const filteredMedia =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return documents.filter(
        (document) => {
          const mediaType =
            getMediaType(
              document.fileName ||
                "",
            );

          const matchesType =
            filter === "ALL" ||
            filter === mediaType;

          const searchableText = [
            document.title,
            document.description,
            document.region,
            ...(document.tags ??
              []),
            document.fileName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchableText.includes(
              query,
            );

          return (
            matchesType &&
            matchesSearch
          );
        },
      );
    }, [
      documents,
      filter,
      search,
    ]);

  return (
    <main className="min-h-screen">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          MEDIA / POLAR ARCHIVE
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Polar Media
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
          Explore approved Antarctic photographs and visual
          research assets with searchable scientific metadata.
        </p>
      </div>

      <div className="p-6">
        {/* SEARCH + FILTER */}
        <section className="border border-neutral-200">
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_180px]">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Search media
              </label>

              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[1.5] text-neutral-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search title, region, tags or filename..."
                  className="h-10 w-full border border-neutral-200 pl-9 pr-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Media type
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target
                      .value as MediaFilter,
                  )
                }
                className="mt-2 h-10 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
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

          <div className="border-t border-neutral-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                {filteredMedia.length} MEDIA RECORD
                {filteredMedia.length ===
                1
                  ? ""
                  : "S"}
              </div>

              <div className="font-mono text-[9px] uppercase tracking-widest text-emerald-600">
                APPROVED ONLY
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <div className="mt-4 border border-neutral-200 px-4 py-8 text-sm text-neutral-500">
            Loading media...
          </div>
        )}

        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredMedia.length ===
            0 && (
            <div className="mt-4 flex min-h-72 flex-col items-center justify-center border border-neutral-200">
              <ImageIcon className="h-8 w-8 stroke-[1.5] text-neutral-400" />

              <div className="mt-4 text-sm font-medium">
                No media found
              </div>

              <p className="mt-2 max-w-md text-center text-xs leading-5 text-neutral-500">
                Approved MEDIA records will
                appear here after an administrator
                uploads and approves them.
              </p>
            </div>
          )}

        {/* MEDIA GRID */}
        {!loading &&
          !error &&
          filteredMedia.length >
            0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMedia.map(
                (document) => {
                  const mediaType =
                    getMediaType(
                      document.fileName ||
                        "",
                    );

                  return (
                    <article
                      key={
                        document._id ??
                        document.id
                      }
                      className="overflow-hidden border border-neutral-200 bg-white"
                    >
                      {/* IMAGE */}
                      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                        {mediaType ===
                        "IMAGE" ? (
                          <a
                            href={
                              document.fileUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full"
                          >
                            <img
                              src={
                                document.fileUrl
                              }
                              alt={
                                document.title
                              }
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                            />
                          </a>
                        ) : (
                          <video
                            src={
                              document.fileUrl
                            }
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold">
                              {
                                document.title
                              }
                            </h2>

                            <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                              {
                                document.region
                              }{" "}
                              /{" "}
                              {
                                document.year
                              }
                            </div>
                          </div>

                          {mediaType ===
                          "IMAGE" ? (
                            <ImageIcon className="h-4 w-4 shrink-0 stroke-[1.5] text-neutral-400" />
                          ) : (
                            <Video className="h-4 w-4 shrink-0 stroke-[1.5] text-neutral-400" />
                          )}
                        </div>

                        {document.description && (
                          <p className="mt-3 line-clamp-3 text-xs leading-5 text-neutral-500">
                            {
                              document.description
                            }
                          </p>
                        )}

                        {document.tags &&
                          document.tags.length >
                            0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {document.tags.map(
                                (tag) => (
                                  <span
                                    key={
                                      tag
                                    }
                                    className="border border-neutral-200 px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-neutral-500"
                                  >
                                    {
                                      tag
                                    }
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                        <a
                          href={
                            document.fileUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex h-8 items-center border border-neutral-200 px-3 text-[10px] font-medium hover:bg-neutral-50"
                        >
                          Open original
                        </a>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
      </div>
    </main>
  );
}