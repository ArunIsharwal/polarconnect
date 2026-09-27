import {
  ArrowUpRight,
  BookOpen,
  Database,
  FileText,
  Image,
  Video,
} from "lucide-react";

type RepositoryItem = {
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
};

function TypeIcon({
  type,
}: {
  type: RepositoryItem["type"];
}) {
  const Icon =
    type === "REPORT"
      ? FileText
      : type === "DATASET"
        ? Database
        : type === "PUBLICATION"
          ? BookOpen
          : type === "MEDIA"
            ? Video
            : Image;

  return (
    <Icon className="h-4 w-4 stroke-[1.5]" />
  );
}

function getFileFormat(fileName: string, type: string) {
  if (fileName) {
    const extension = fileName.split(".").pop();

    if (extension) {
      return extension.toUpperCase();
    }
  }

  return type;
}

export default function RepositoryRow({
  item,
}: {
  item: RepositoryItem;
}) {
  const statusTone =
    item.status === "APPROVED"
      ? "text-emerald-600"
      : item.status === "PENDING"
        ? "text-amber-600"
        : item.status === "REJECTED"
          ? "text-red-600"
          : "text-neutral-500";

  const format = getFileFormat(
    item.fileName,
    item.type,
  );

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_120px] gap-4 border-b border-neutral-200 px-4 py-4 transition-colors hover:bg-neutral-50">
      {/* ICON */}
      <div className="pt-1 text-neutral-500">
        <TypeIcon type={item.type} />
      </div>

      {/* MAIN INFORMATION */}
      <div className="min-w-0">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {item.id}
          </span>

          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {item.type}
          </span>

          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {item.region}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-semibold tracking-tight">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1 text-sm leading-5 text-neutral-500">
            {item.description}
          </p>
        )}

        {item.fileName && (
          <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {item.fileName}
          </div>
        )}

        {/* MOBILE OPEN LINK */}
        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-3 inline-flex h-7 items-center gap-1 border-b border-transparent font-mono text-[9px] uppercase tracking-widest text-neutral-400 hover:border-black hover:text-black sm:hidden"
          >
            Open
            <ArrowUpRight className="h-3 w-3 stroke-[1.5]" />
          </a>
        )}
      </div>

      {/* RIGHT METADATA */}
      <div className="hidden text-right sm:block">
        <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {format}
        </div>

        <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {item.year}
        </div>

        <div
          className={`mt-2 font-mono text-[9px] uppercase tracking-widest ${statusTone}`}
        >
          {item.status}
        </div>

        {item.fileUrl && (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400 hover:text-black"
          >
            Open
            <ArrowUpRight className="h-3 w-3 stroke-[1.5]" />
          </a>
        )}
      </div>
    </article>
  );
}