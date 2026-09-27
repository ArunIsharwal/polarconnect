"use client";

import { Bot, User } from "lucide-react";

type Source = {
  id: string;
  title: string;
  contentType: string;
  region: string;
  year: number | null;
  fileUrl: string;
};

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function MessageBubble({
  role,
  content,
  sources = [],
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50">
          <Bot className="h-3.5 w-3.5 stroke-[1.5]" />
        </div>
      )}

      <div
        className={`max-w-[85%] ${
          isUser
            ? "border border-black bg-black text-white"
            : "border border-neutral-200 bg-white"
        }`}
      >
        <div className="px-4 py-3">
          <div className="whitespace-pre-wrap text-sm leading-6">
            {content}
          </div>
        </div>

        {!isUser && sources.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50">
            <div className="px-4 pt-3">
              <div className="font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                Repository sources
              </div>
            </div>

            <div className="p-3">
              <div className="space-y-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="border border-neutral-200 bg-white p-3"
                  >
                    <div className="text-xs font-medium">
                      {source.title}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-widest text-neutral-400">
                      <span>{source.contentType}</span>
                      <span>{source.region}</span>
                      {source.year && <span>{source.year}</span>}
                    </div>

                    {source.fileUrl && (
                      <a
                        href={source.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-[10px] font-medium underline underline-offset-2"
                      >
                        Open source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center border border-black bg-black text-white">
          <User className="h-3.5 w-3.5 stroke-[1.5]" />
        </div>
      )}
    </div>
  );
}