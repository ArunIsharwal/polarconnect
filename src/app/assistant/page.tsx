import ChatWindows from "@/components/assistant/ChatWindows";

export default function AssistantPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-4 grid border border-neutral-200 lg:grid-cols-[1fr_280px]">
          <div className="border-b border-neutral-200 p-6 lg:border-b-0 lg:border-r">
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              AI / SCIENCE ASSISTANT
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Ask the polar archive.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              Query approved PolarConnect records using natural
              language. The assistant retrieves relevant repository
              records before generating an answer.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1">
            <div className="border-b border-neutral-200 p-5 lg:border-b">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                KNOWLEDGE SCOPE
              </div>

              <div className="mt-2 text-sm font-semibold">
                Approved repository
              </div>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Pending and rejected records are excluded.
              </p>
            </div>

            <div className="p-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                AI MODE
              </div>

              <div className="mt-2 font-mono text-sm">
                RAG / REPOSITORY
              </div>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Retrieve → contextualize → answer → cite.
              </p>
            </div>
          </div>
        </section>

        <ChatWindows />

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <InfoCard
            code="01 / RETRIEVE"
            title="Approved records"
            text="The assistant searches only records that passed admin approval."
          />

          <InfoCard
            code="02 / CONTEXT"
            title="Scientific context"
            text="Metadata, descriptions, tags and available AI summaries are supplied to the model."
          />

          <InfoCard
            code="03 / ANSWER"
            title="Source-aware response"
            text="Responses include repository records used as the answer context."
          />
        </div>

        <div className="mt-4 border border-neutral-200 bg-neutral-50 p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            IMPORTANT
          </div>

          <p className="mt-2 max-w-4xl text-xs leading-5 text-neutral-500">
            The assistant is a repository interface, not a replacement
            for the original scientific source. Check the linked record
            when a precise scientific claim is important.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  code,
  title,
  text,
}: {
  code: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-neutral-200 p-5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
        {code}
      </div>

      <div className="mt-3 text-sm font-semibold">
        {title}
      </div>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        {text}
      </p>
    </div>
  );
}