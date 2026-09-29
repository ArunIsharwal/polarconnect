// "use client";

// import { useRef, useState } from "react";
// import {
//   Check,
//   FileText,
//   Image,
//   Upload,
//   Video,
//   X,
// } from "lucide-react";

// import UploadProgress from "./UploadProgress";

// type UploadStatus =
//   | "IDLE"
//   | "UPLOADING"
//   | "PROCESSING"
//   | "COMPLETE";

// export default function UploadPanel() {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [file, setFile] = useState<File | null>(null);

//   const [title, setTitle] = useState("");
//   const [type, setType] = useState("REPORT");
//   const [region, setRegion] = useState("ANTARCTICA");
//   const [year, setYear] = useState("2026");
//   const [description, setDescription] = useState("");
//   const [tags, setTags] = useState("");

//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState<UploadStatus>("IDLE");
//   const [error, setError] = useState("");

//   function handleFile(file: File) {
//     setError("");
//     setFile(file);

//     // Automatically use file name as title
//     // if title is empty.
//     if (!title) {
//       setTitle(file.name.replace(/\.[^/.]+$/, ""));
//     }
//   }

//   function handleFileChange(
//     event: React.ChangeEvent<HTMLInputElement>
//   ) {
//     const selected = event.target.files?.[0];

//     if (selected) {
//       handleFile(selected);
//     }
//   }

//   function clearFile() {
//     setFile(null);
//     setProgress(0);
//     setStatus("IDLE");
//     setError("");

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }

//   async function uploadDocument() {
//     if (!file) {
//       setError("Please select a file first.");
//       return;
//     }

//     if (!title.trim()) {
//       setError("Please enter a title.");
//       return;
//     }

//     setError("");
//     setStatus("UPLOADING");
//     setProgress(10);

//     try {
//       // FormData is required because we are sending
//       // an actual file together with the metadata.
//       const formData = new FormData();

//       formData.append("file", file);
//       formData.append("title", title.trim());
//       formData.append("contentType", type);
//       formData.append("region", region);
//       formData.append("year", year);
//       formData.append("description", description);
//       formData.append("tags", tags);

//       setProgress(30);

//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       setProgress(70);

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(
//           result.message || "Upload failed"
//         );
//       }

//       setStatus("PROCESSING");
//       setProgress(90);

//       // Small delay so the PROCESSING state
//       // can be visible in the UI.
//       await new Promise((resolve) =>
//         setTimeout(resolve, 500)
//       );

//       setProgress(100);
//       setStatus("COMPLETE");

//       console.log("Upload successful:", result);
//     } catch (error) {
//       console.error("Upload error:", error);

//       setStatus("IDLE");
//       setProgress(0);

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Something went wrong while uploading the file."
//       );
//     }
//   }

//   const isComplete = status === "COMPLETE";

//   return (
//     <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
//       <section className="border border-neutral-200">
//         <div className="border-b border-neutral-200 px-4 py-4">
//           <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//             INGEST / NEW SCIENTIFIC RECORD
//           </div>

//           <h2 className="mt-1 text-lg font-semibold tracking-tight">
//             Upload document
//           </h2>
//         </div>

//         <div className="p-4 sm:p-6">
//           {/* FILE INPUT */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".pdf,.csv,.png,.jpg,.jpeg,.mp4,.mov"
//             onChange={handleFileChange}
//             className="hidden"
//           />

//           {/* FILE SELECTOR */}
//           {!file ? (
//             <button
//               type="button"
//               onClick={() =>
//                 fileInputRef.current?.click()
//               }
//               className="flex min-h-52 w-full flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center hover:border-black hover:bg-white"
//             >
//               <Upload className="h-6 w-6 stroke-[1.5] text-neutral-500" />

//               <span className="mt-4 text-sm font-medium">
//                 Select scientific content
//               </span>

//               <span className="mt-2 text-xs text-neutral-500">
//                 PDF, CSV, image or video
//               </span>

//               <span className="mt-3 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//                 MAXIMUM FILE SIZE / 100 MB
//               </span>
//             </button>
//           ) : (
//             <div className="border border-neutral-200">
//               <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
//                 <div className="flex min-w-0 items-center gap-3">
//                   <FileIcon filename={file.name} />

//                   <div className="min-w-0">
//                     <div className="truncate text-sm font-medium">
//                       {file.name}
//                     </div>

//                     <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//                       {(file.size / 1024 / 1024).toFixed(2)} MB
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={clearFile}
//                   className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 hover:bg-neutral-50"
//                 >
//                   <X className="h-4 w-4 stroke-[1.5]" />
//                 </button>
//               </div>

//               <div className="p-4">
//                 <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//                   File ready
//                 </div>

//                 <div className="mt-2 text-xs text-neutral-500">
//                   Metadata can now be attached to this scientific
//                   record.
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* TITLE */}
//           <div className="mt-6">
//             <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//               Title
//             </label>

//             <input
//               value={title}
//               onChange={(event) =>
//                 setTitle(event.target.value)
//               }
//               placeholder="Enter scientific record title"
//               className="mt-2 h-9 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
//             />
//           </div>

//           {/* TYPE / REGION / YEAR */}
//           <div className="mt-5 grid gap-4 md:grid-cols-3">
//             <Field
//               label="Content type"
//               value={type}
//               onChange={setType}
//               options={[
//                 "REPORT",
//                 "DATASET",
//                 "PUBLICATION",
//                 "MEDIA",
//               ]}
//             />

//             <Field
//               label="Region"
//               value={region}
//               onChange={setRegion}
//               options={[
//                 "ANTARCTICA",
//                 "ARCTIC",
//                 "SOUTHERN OCEAN",
//                 "MAITRI",
//               ]}
//             />

//             <Field
//               label="Year"
//               value={year}
//               onChange={setYear}
//               options={[
//                 "2026",
//                 "2025",
//                 "2024",
//                 "2023",
//               ]}
//             />
//           </div>

//           {/* DESCRIPTION */}
//           <div className="mt-5">
//             <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//               Description
//             </label>

//             <textarea
//               value={description}
//               onChange={(event) =>
//                 setDescription(event.target.value)
//               }
//               placeholder="Describe the scientific content..."
//               rows={5}
//               className="mt-2 w-full resize-none border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
//             />
//           </div>

//           {/* TAGS */}
//           <div className="mt-5">
//             <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//               Tags
//             </label>

//             <input
//               value={tags}
//               onChange={(event) =>
//                 setTags(event.target.value)
//               }
//               placeholder="antarctica, climate, expedition"
//               className="mt-2 h-9 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
//             />

//             <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//               Separate tags with commas
//             </p>
//           </div>

//           {/* ERROR MESSAGE */}
//           {error && (
//             <div className="mt-4 border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
//               {error}
//             </div>
//           )}

//           {/* PROGRESS */}
//           {status !== "IDLE" && (
//             <div className="mt-6">
//               <UploadProgress
//                 progress={progress}
//                 status={
//                   status === "UPLOADING"
//                     ? "UPLOADING"
//                     : status === "PROCESSING"
//                       ? "PROCESSING"
//                       : "COMPLETE"
//                 }
//               />
//             </div>
//           )}

//           {/* BUTTONS */}
//           <div className="mt-6 flex flex-wrap gap-2">
//             <button
//               type="button"
//               disabled={
//                 !file ||
//                 !title.trim() ||
//                 status === "UPLOADING" ||
//                 status === "PROCESSING" ||
//                 status === "COMPLETE"
//               }
//               onClick={uploadDocument}
//               className="inline-flex h-9 items-center gap-2 rounded-sm bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
//             >
//               {isComplete ? (
//                 <>
//                   <Check className="h-4 w-4 stroke-[1.5]" />
//                   Queued for review
//                 </>
//               ) : (
//                 <>
//                   <Upload className="h-4 w-4 stroke-[1.5]" />
//                   Queue for processing
//                 </>
//               )}
//             </button>

//             {!isComplete && (
//               <button
//                 type="button"
//                 onClick={clearFile}
//                 className="inline-flex h-9 items-center rounded-sm border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* RIGHT SIDE PIPELINE */}
//       <aside className="border border-neutral-200">
//         <div className="border-b border-neutral-200 px-4 py-4">
//           <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//             INGESTION PIPELINE
//           </div>

//           <h2 className="mt-1 text-base font-semibold">
//             What happens next?
//           </h2>
//         </div>

//         <PipelineStep
//           number="01"
//           title="File validation"
//           text="Check type, size and file integrity."
//           active={!file}
//         />

//         <PipelineStep
//           number="02"
//           title="Metadata extraction"
//           text="Read available document metadata."
//         />

//         <PipelineStep
//           number="03"
//           title="Text extraction"
//           text="Extract searchable scientific content."
//         />

//         <PipelineStep
//           number="04"
//           title="AI processing"
//           text="Generate summary and suggested tags."
//         />

//         <PipelineStep
//           number="05"
//           title="Admin review"
//           text="Approve the record before publication."
//         />

//         <div className="border-t border-neutral-200 bg-neutral-50 p-4">
//           <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//             CURRENT MODE
//           </div>

//           <div className="mt-2 text-xs font-medium">
//             Local storage + MongoDB
//           </div>

//           <p className="mt-2 text-xs leading-5 text-neutral-500">
//             Uploaded files are stored locally and their metadata
//             is saved in MongoDB.
//           </p>
//         </div>
//       </aside>
//     </div>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   options,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   options: string[];
// }) {
//   return (
//     <div>
//       <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//         {label}
//       </label>

//       <select
//         value={value}
//         onChange={(event) =>
//           onChange(event.target.value)
//         }
//         className="mt-2 h-9 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-black"
//       >
//         {options.map((option) => (
//           <option key={option} value={option}>
//             {option}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function FileIcon({ filename }: { filename: string }) {
//   const extension = filename
//     .split(".")
//     .pop()
//     ?.toLowerCase();

//   if (
//     extension === "png" ||
//     extension === "jpg" ||
//     extension === "jpeg"
//   ) {
//     return (
//       <Image className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
//     );
//   }

//   if (
//     extension === "mp4" ||
//     extension === "mov"
//   ) {
//     return (
//       <Video className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
//     );
//   }

//   return (
//     <FileText className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
//   );
// }

// function PipelineStep({
//   number,
//   title,
//   text,
//   active,
// }: {
//   number: string;
//   title: string;
//   text: string;
//   active?: boolean;
// }) {
//   return (
//     <div className="border-b border-neutral-200 p-4">
//       <div className="flex gap-3">
//         <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//           {number}
//         </span>

//         <div>
//           <div className="text-xs font-semibold">
//             {title}
//           </div>

//           <p className="mt-1 text-xs leading-5 text-neutral-500">
//             {text}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

import {
  Check,
  FileText,
  Image,
  Upload,
  Video,
  X,
} from "lucide-react";

import UploadProgress from "./UploadProgress";

type UploadStatus =
  | "IDLE"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETE";

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
  ".mp4",
  ".mov",
];

const MIME_TYPES: Record<
  string,
  string
> = {
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

export default function UploadPanel() {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [title, setTitle] =
    useState("");

  const [type, setType] =
    useState("REPORT");

  const [region, setRegion] =
    useState("ANTARCTICA");

  const [year, setYear] =
    useState("2026");

  const [description, setDescription] =
    useState("");

  const [tags, setTags] =
    useState("");

  const [progress, setProgress] =
    useState(0);

  const [status, setStatus] =
    useState<UploadStatus>("IDLE");

  const [error, setError] =
    useState("");

  function handleFile(
    selectedFile: File,
  ) {
    setError("");

    const extension =
      getExtension(
        selectedFile.name,
      );

    if (
      !ALLOWED_EXTENSIONS.includes(
        extension,
      )
    ) {
      setError(
        `File type ${
          extension || "unknown"
        } is not supported.`,
      );
      return;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File size must be 100 MB or less.",
      );
      return;
    }

    if (selectedFile.size === 0) {
      setError(
        "The selected file is empty.",
      );
      return;
    }

    setFile(selectedFile);

    if (!title) {
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
    setProgress(0);
    setStatus("IDLE");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  async function uploadDocument() {
    if (!file) {
      setError(
        "Please select a file first.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a title.",
      );
      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File size must be 100 MB or less.",
      );
      return;
    }

    const extension =
      getExtension(file.name);

    const mimeType =
      MIME_TYPES[extension];

    if (!mimeType) {
      setError(
        "This file type is not supported.",
      );
      return;
    }

    setError("");
    setStatus("UPLOADING");
    setProgress(0);

    try {
      const safeFileName =
        file.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "-",
          )
          .replace(
            /-+/g,
            "-",
          )
          .slice(0, 180);

      const pathname =
        `documents/${crypto.randomUUID()}-${safeFileName}`;

      // const metadata = {
      //   fileName: file.name,
      //   title: title.trim(),
      //   contentType: mimeType,
      //   region,
      //   year,
      //   description:
      //     description.trim(),
      //   tags: tags
      //     .split(",")
      //     .map(
      //       (tag) => tag.trim(),
      //     )
      //     .filter(Boolean),
      // };

      const metadata = {
  fileName: file.name,
  title: title.trim(),

  // IMPORTANT:
  // This is the repository record type:
  // REPORT / DATASET / PUBLICATION / MEDIA
  contentType: type,

  // Keep the actual file MIME type separately.
  mimeType,

  region,
  year,
  description:
    description.trim(),
  tags: tags
    .split(",")
    .map(
      (tag) => tag.trim(),
    )
    .filter(Boolean),
};

      const blob = await upload(
        pathname,
        file,
        {
          access: "public",

          handleUploadUrl:
            "/api/upload",

          multipart: true,

          clientPayload:
            JSON.stringify(
              metadata,
            ),

          onUploadProgress:
            (event) => {
              setProgress(
                Math.round(
                  event.percentage,
                ),
              );
            },
        },
      );

      console.log(
        "Vercel Blob upload successful:",
        blob.url,
      );

      setProgress(98);
      setStatus("PROCESSING");

      // The Vercel Blob completion callback
      // creates the MongoDB record.
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            2000,
          ),
      );

      setProgress(100);
      setStatus("COMPLETE");
    } catch (error) {
      console.error(
        "Upload error:",
        error,
      );

      setStatus("IDLE");
      setProgress(0);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the file.",
      );
    }
  }

  const isComplete =
    status === "COMPLETE";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
      <section className="border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            INGEST / NEW SCIENTIFIC RECORD
          </div>

          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Upload document
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.png,.jpg,.jpeg,.mp4,.mov"
            onChange={
              handleFileChange
            }
            className="hidden"
          />

          {!file ? (
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="flex min-h-52 w-full flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center hover:border-black hover:bg-white"
            >
              <Upload className="h-6 w-6 stroke-[1.5] text-neutral-500" />

              <span className="mt-4 text-sm font-medium">
                Select scientific content
              </span>

              <span className="mt-2 text-xs text-neutral-500">
                PDF, CSV, image or video
              </span>

              <span className="mt-3 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                MAXIMUM FILE SIZE / 100 MB
              </span>
            </button>
          ) : (
            <div className="border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileIcon
                    filename={
                      file.name
                    }
                  />

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {file.name}
                    </div>

                    <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(
                        2,
                      )}{" "}
                      MB
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    clearFile
                  }
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 hover:bg-neutral-50"
                >
                  <X className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>

              <div className="p-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  File ready
                </div>

                <div className="mt-2 text-xs text-neutral-500">
                  Metadata can now be attached to this scientific
                  record.
                </div>
              </div>
            </div>
          )}

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
              placeholder="Enter scientific record title"
              className="mt-2 h-9 w-full border border-neutral-200 px-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field
              label="Content type"
              value={type}
              onChange={
                setType
              }
              options={[
                "REPORT",
                "DATASET",
                "PUBLICATION",
                "MEDIA",
              ]}
            />

            <Field
              label="Region"
              value={region}
              onChange={
                setRegion
              }
              options={[
                "ANTARCTICA",
                "ARCTIC",
                "SOUTHERN OCEAN",
                "MAITRI",
              ]}
            />

            <Field
              label="Year"
              value={year}
              onChange={
                setYear
              }
              options={[
                "2026",
                "2025",
                "2024",
                "2023",
                "2022",
                "2021",
                "2020",
              ]}
            />
          </div>

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
              placeholder="Describe the scientific content..."
              rows={5}
              className="mt-2 w-full resize-none border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black"
            />
          </div>

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
              placeholder="antarctica, climate, expedition"
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

          {status !== "IDLE" && (
            <div className="mt-6">
              <UploadProgress
                progress={
                  progress
                }
                status={
                  status ===
                  "UPLOADING"
                    ? "UPLOADING"
                    : status ===
                      "PROCESSING"
                      ? "PROCESSING"
                      : "COMPLETE"
                }
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                !file ||
                !title.trim() ||
                status ===
                  "UPLOADING" ||
                status ===
                  "PROCESSING" ||
                status ===
                  "COMPLETE"
              }
              onClick={
                uploadDocument
              }
              className="inline-flex h-9 items-center gap-2 rounded-sm bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {isComplete ? (
                <>
                  <Check className="h-4 w-4 stroke-[1.5]" />
                  Queued for review
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 stroke-[1.5]" />
                  Queue for processing
                </>
              )}
            </button>

            {!isComplete && (
              <button
                type="button"
                onClick={
                  clearFile
                }
                className="inline-flex h-9 items-center rounded-sm border border-neutral-200 px-4 text-xs font-medium hover:bg-neutral-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <aside className="border border-neutral-200">
        <div className="border-b border-neutral-200 px-4 py-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            INGESTION PIPELINE
          </div>

          <h2 className="mt-1 text-base font-semibold">
            What happens next?
          </h2>
        </div>

        <PipelineStep
          number="01"
          title="File validation"
          text="Check type, size and file integrity."
          active={!file}
        />

        <PipelineStep
          number="02"
          title="Cloud file storage"
          text="Upload directly to Vercel Blob."
        />

        <PipelineStep
          number="03"
          title="Metadata registration"
          text="Save the scientific record in MongoDB."
        />

        <PipelineStep
          number="04"
          title="AI processing"
          text="Generate summary and suggested tags."
        />

        <PipelineStep
          number="05"
          title="Admin review"
          text="Approve the record before publication."
        />

        <div className="border-t border-neutral-200 bg-neutral-50 p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            CURRENT MODE
          </div>

          <div className="mt-2 text-xs font-medium">
            Vercel Blob + MongoDB
          </div>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Files are stored in Vercel Blob and scientific metadata is
            saved in MongoDB.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-9 w-full border border-neutral-200 bg-white px-3 text-xs outline-none focus:border-black"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

function FileIcon({
  filename,
}: {
  filename: string;
}) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg"
  ) {
    return (
      <Image className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
    );
  }

  if (
    extension === "mp4" ||
    extension === "mov"
  ) {
    return (
      <Video className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
    );
  }

  return (
    <FileText className="h-5 w-5 shrink-0 stroke-[1.5] text-neutral-500" />
  );
}

function PipelineStep({
  number,
  title,
  text,
  active,
}: {
  number: string;
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="border-b border-neutral-200 p-4">
      <div className="flex gap-3">
        <span
          className={`font-mono text-[9px] uppercase tracking-widest ${
            active
              ? "text-black"
              : "text-neutral-400"
          }`}
        >
          {number}
        </span>

        <div>
          <div className="text-xs font-semibold">
            {title}
          </div>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function getExtension(
  filename: string,
) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase();

  return extension
    ? `.${extension}`
    : "";
}