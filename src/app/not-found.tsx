import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          ERROR / 404
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Record not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
          The requested PolarConnect resource could not be located.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-9 items-center rounded-sm bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Return to overview
        </Link>
      </div>
    </main>
  );
}