type UploadProgressProps = {
  progress: number;
  status: "UPLOADING" | "PROCESSING" | "COMPLETE";
};

export default function UploadProgress({
  progress,
  status,
}: UploadProgressProps) {
  return (
    <div className="border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          Upload pipeline
        </span>

        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          {status}
        </span>
      </div>

      <div className="mt-4 h-1 w-full bg-neutral-200">
        <div
          className="h-1 bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {progress}%
        </span>

        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          {status === "UPLOADING"
            ? "Transferring file"
            : status === "PROCESSING"
              ? "Preparing metadata"
              : "Ready for review"}
        </span>
      </div>
    </div>
  );
}