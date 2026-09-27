"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, RotateCcw } from "lucide-react";

import MessageBubble from "./MessageBubble";

type Source = {
  id: string;
  title: string;
  contentType: string;
  region: string;
  year: number | null;
  fileUrl: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const STARTER_QUESTIONS = [
  "What documents are available about Antarctica?",
  "Summarize the main topics in the repository.",
  "What research areas are represented in the approved records?",
  "Tell me about the latest approved record.",
];

export default function ChatWindows() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello. I am the PolarConnect Science Assistant. Ask me about the approved scientific records in the repository.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(question?: string) {
    const text = (question ?? input).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const previousHistory = messages
      .filter((message) => message.id !== "welcome")
      .slice(-6)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: text,
          history: previousHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Assistant request failed",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer,
          sources: Array.isArray(data.sources)
            ? data.sources
            : [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Unable to reach the science assistant right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function clearChat() {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Conversation cleared. Ask me about the approved PolarConnect repository.",
      },
    ]);

    setInput("");
  }

  return (
    <section className="border border-neutral-200">
      <div className="border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              ASSISTANT / REPOSITORY MODE
            </div>

            <div className="mt-1 text-sm font-semibold">
              Ask the polar archive
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="inline-flex h-8 items-center gap-2 border border-neutral-200 px-3 text-[10px] font-medium uppercase tracking-widest hover:bg-neutral-50"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[1.5]" />
            Clear
          </button>
        </div>
      </div>

      <div className="min-h-[520px] max-h-[620px] overflow-y-auto bg-neutral-50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              sources={message.sources}
            />
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center border border-neutral-200 bg-white">
                <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.5]" />
              </div>

              <div className="border border-neutral-200 bg-white px-4 py-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  SEARCHING APPROVED RECORDS / GENERATING RESPONSE
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {STARTER_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendMessage(question)}
                disabled={loading}
                className="border border-neutral-200 px-3 py-2 text-left text-[10px] text-neutral-600 hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border border-neutral-300 bg-white p-2 focus-within:border-black"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              placeholder="Ask about polar research, records, regions, datasets or expeditions..."
              className="min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-black text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin stroke-[1.5]" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[1.5]" />
              )}
            </button>
          </form>

          <div className="mt-2 flex justify-between gap-4">
            <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-400">
              ENTER / SEND
            </span>

            <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-400">
              SOURCES / APPROVED ONLY
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}