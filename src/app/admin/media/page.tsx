import MediaUploadPanel from "@/components/media/MediaUploadPanel";

export default function AdminMediaPage() {
  return (
    <main className="min-h-screen">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          ADMIN / MEDIA
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Media Management
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Upload Antarctic photographs and visual research
          assets with searchable metadata and tags.
        </p>
      </div>

      <div className="p-6">
        <div className="max-w-5xl">
          <MediaUploadPanel />
        </div>

        <div className="mt-4 border border-neutral-200 bg-neutral-50 px-4 py-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            PUBLICATION WORKFLOW
          </div>

          <div className="mt-2 text-sm">
            Upload → Vercel Blob → MongoDB → Admin Approval → Public Media
          </div>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Uploaded images remain hidden from students until an administrator
            approves the record.
          </p>
        </div>
      </div>
    </main>
  );
}