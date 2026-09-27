import UploadPanel from "@/components/upload/UploadPanel";

export default function AdminDocumentsPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          ADMIN / INGESTION
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Document Management
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
          Add research reports, datasets, publications and media to
          the PolarConnect knowledge repository.
        </p>
      </div>

      <UploadPanel />
    </div>
  );
}