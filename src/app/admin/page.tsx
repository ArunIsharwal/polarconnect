// import Link from "next/link";

// export default function AdminPage() {
//   return (
//     <div className="p-4 sm:p-6">
//       <section className="border border-neutral-200 p-6">
//         <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
//           ADMIN / CONTROL CENTER
//         </div>

//         <h1 className="mt-4 text-3xl font-bold tracking-tight">
//           Administration
//         </h1>

//         <div className="mt-6 grid gap-3 sm:grid-cols-2">
//           <Link
//             href="/admin/documents"
//             className="border border-neutral-200 p-4 hover:bg-neutral-50"
//           >
//             <div className="text-sm font-semibold">
//               Document Management
//             </div>

//             <p className="mt-2 text-xs leading-5 text-neutral-500">
//               Upload and inspect repository records.
//             </p>
//           </Link>

//           <Link
//             href="/admin/approvals"
//             className="border border-neutral-200 p-4 hover:bg-neutral-50"
//           >
//             <div className="text-sm font-semibold">
//               Approval Queue
//             </div>

//             <p className="mt-2 text-xs leading-5 text-neutral-500">
//               Review content before publication.
//             </p>
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }

import Link from "next/link";
import {
  CheckCircle2,
  Database,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <div className="border border-neutral-200">
        {/* HEADER */}
        <div className="border-b border-neutral-200 px-6 py-6">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            ADMIN / CONTROL CENTER
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Administration
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage scientific documents, datasets, media and
            publication approvals.
          </p>
        </div>

        {/* ADMIN OPTIONS */}
        <div className="grid gap-px bg-neutral-200 md:grid-cols-2 xl:grid-cols-4">
          {/* DOCUMENT MANAGEMENT */}
          <Link
            href="/admin/documents"
            className="bg-white p-5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-neutral-200">
                <FileText className="h-4 w-4 stroke-[1.5]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Document Management
                </h2>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Upload research papers and scientific records.
                </p>
              </div>
            </div>

            <div className="mt-5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Open documents →
            </div>
          </Link>

          {/* DATASET UPLOAD */}
          <Link
            href="/admin/documents"
            className="bg-white p-5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-neutral-200">
                <Database className="h-4 w-4 stroke-[1.5]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Dataset Upload
                </h2>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Upload datasets and select DATASET as content type.
                </p>
              </div>
            </div>

            <div className="mt-5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Upload dataset →
            </div>
          </Link>

          {/* APPROVAL QUEUE */}
          <Link
            href="/admin/approvals"
            className="bg-white p-5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-neutral-200">
                <CheckCircle2 className="h-4 w-4 stroke-[1.5]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Approval Queue
                </h2>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Review and approve content before publication.
                </p>
              </div>
            </div>

            <div className="mt-5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Review records →
            </div>
          </Link>

          {/* MEDIA MANAGEMENT */}
          <Link
            href="/admin/media"
            className="bg-white p-5 transition-colors hover:bg-neutral-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-neutral-200">
                <ImageIcon className="h-4 w-4 stroke-[1.5]" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Media Management
                </h2>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Upload polar images and manage media metadata.
                </p>
              </div>
            </div>

            <div className="mt-5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Upload media →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}