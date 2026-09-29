"use client";

import {
  Check,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

type UploadStatus =
  | "IDLE"
  | "UPLOADING"
  | "COMPLETE";

export default function MediaUploadPanel() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [title, setTitle] =
    useState("");

  const [region, setRegion] =
    useState("ANTARCTICA");

  const [year, setYear] =
    useState("2026");

  const [description, setDescription] =
    useState("");

  const [tags, setTags] =
    useState("");

  const [status, setStatus] =
    useState<UploadStatus>("IDLE");

  const [error, setError] =
    useState("");

  function handleFile(
    selectedFile: File,
  ) {
    setError("");

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/jpg",
      ].includes(selectedFile.type)
    ) {
      setError(
        "Only PNG and JPG/JPEG images are allowed.",
      );
      return;
    }

    if (
      selectedFile.size >
      100 * 1024 * 1024
    ) {
      setError(
        "Image size must be 100 MB or less.",
      );
      return;
    }

    setFile(selectedFile);

    if (!title.trim()) {
      setTitle(
        selectedFile.name.replace(
          /\.[^/.]+$/,
          "",
        ),
      );
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      event.target.files?.[0];

    if (selected) {
      handleFile(selected);
    }
  }

  function clearFile() {
    setFile(null);
    setStatus("IDLE");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadMedia() {
    if (!file) {
      setError(
        "Please select an image first.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a title.",
      );
      return;
    }

    setError("");
    setStatus("UPLOADING");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "title",
        title.trim(),
      );

      // IMPORTANT:
      // This tells the existing upload
      // API that this record belongs
      // to the Media section.
      formData.append(
        "contentType",
        "MEDIA",
      );

      formData.append(
        "region",
        region,
      );

      formData.append(
        "year",
        year,
      );

      formData.append(
        "description",
        description.trim(),
      );

      formData.append(
        "tags",
        tags,
      );

      const response =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
            credentials:
              "include",
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
            "Image upload failed.",
        );
      }

      setStatus("COMPLETE");
    } catch (uploadError) {
      console.error(
        "Media upload error:",
        uploadError,
      );

      setStatus("IDLE");

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Image upload failed.",
      );
    }
  }

  return (
    <section className="border border-neutral-200">
      <div className="border-b border-neutral-200 px-4 py-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          ADMIN / MEDIA INGESTION
        </div>

        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Upload polar media
        </h2>

        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Upload a scientific or outreach image,
          attach metadata and tags, then submit it
          for administrator approval.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex min-h-48 w-full flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center hover:border-black hover:bg-white"
          >
            <ImageIcon className="h-7 w-7 stroke-[1.5] text-neutral-500" />

            <span className="mt-4 text-sm font-medium">
              Select an image
            </span>

            <span className="mt-2 text-xs text-neutral-500">
              PNG, JPG or JPEG
            </span>

            <span className="mt-3 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              MAXIMUM / 100 MB
            </span>
          </button>
        ) : (
          <div className="border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <ImageIcon className="h-5 w-5 shrink-0 stroke-[1.5]" />

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {file.name}
                  </div>

                  <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={clearFile}
                className="inline-flex h-8 w-8 items-center justify-center border border-neutral-200 hover:bg-neutral-50"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-hidden border border-neutral-200 bg-neutral-50">
                <img
                  src={URL.createObjectURL(
                    file,
                  )}
                  alt={file.name}
                  className="max-h-72 w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* TITLE */}
        <div className="mt-6">
          <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Title
          </label>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            placeholder="e.g. Antarctic Ice Shelf Survey"
            className="mt-2 h-9 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
          />
        </div>

        {/* REGION / YEAR */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Region
            </label>

            <select
              value={region}
              onChange={(event) =>
                setRegion(
                  event.target.value,
                )
              }
              className="mt-2 h-9 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
            >
              <option>
                ANTARCTICA
              </option>
              <option>
                ARCTIC
              </option>
              <option>
                SOUTHERN OCEAN
              </option>
              <option>
                MAITRI
              </option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Year
            </label>

            <select
              value={year}
              onChange={(event) =>
                setYear(
                  event.target.value,
                )
              }
              className="mt-2 h-9 w-full border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-black"
            >
              <option>
                2026
              </option>
              <option>
                2025
              </option>
              <option>
                2024
              </option>
              <option>
                2023
              </option>
              <option>
                2022
              </option>
              <option>
                2021
              </option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Describe what the image shows..."
            className="mt-2 w-full resize-none border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {/* TAGS */}
        <div className="mt-5">
          <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Tags
          </label>

          <input
            value={tags}
            onChange={(event) =>
              setTags(
                event.target.value,
              )
            }
            placeholder="iceberg, Antarctica, sea-ice, satellite"
            className="mt-2 h-9 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
          />

          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            Separate tags with commas
          </p>
        </div>

        {error && (
          <div className="mt-4 border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {status ===
          "COMPLETE" && (
          <div className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-700">
            Image uploaded successfully and
            submitted for admin approval.
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            disabled={
              !file ||
              !title.trim() ||
              status ===
                "UPLOADING" ||
              status ===
                "COMPLETE"
            }
            onClick={
              uploadMedia
            }
            className="inline-flex h-9 items-center gap-2 bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {status ===
            "COMPLETE" ? (
              <>
                <Check className="h-4 w-4 stroke-[1.5]" />
                Submitted for review
              </>
            ) : status ===
              "UPLOADING" ? (
              <>
                <Upload className="h-4 w-4 animate-pulse stroke-[1.5]" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 stroke-[1.5]" />
                Upload Media
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}