export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto h-7 w-7 animate-spin border border-neutral-300 border-t-black" />

        <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
          Loading PolarConnect
        </p>
      </div>
    </div>
  );
}