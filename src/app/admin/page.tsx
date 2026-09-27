import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4 sm:p-6">
      <section className="border border-neutral-200 p-6">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          ADMIN / CONTROL CENTER
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Administration
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/documents"
            className="border border-neutral-200 p-4 hover:bg-neutral-50"
          >
            <div className="text-sm font-semibold">
              Document Management
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Upload and inspect repository records.
            </p>
          </Link>

          <Link
            href="/admin/approvals"
            className="border border-neutral-200 p-4 hover:bg-neutral-50"
          >
            <div className="text-sm font-semibold">
              Approval Queue
            </div>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Review content before publication.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}