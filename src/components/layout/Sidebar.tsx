"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Database,
  Globe2,
  Image,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";

type ApiDocument = {
  _id: string;
  status?: string;
};

const primaryLinks = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Repository",
    href: "/repository",
    icon: BookOpen,
  },
  {
    name: "Expeditions",
    href: "/expeditions",
    icon: Globe2,
  },
  {
    name: "Datasets",
    href: "/datasets",
    icon: Database,
  },
  {
    name: "Media",
    href: "/media",
    icon: Image,
  },
];

const intelligenceLinks = [
  {
    name: "AI Assistant",
    href: "/assistant",
    icon: Sparkles,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [approvedCount, setApprovedCount] = useState<
    number | null
  >(null);

  useEffect(() => {
    async function loadApprovedCount() {
      try {
        const response = await fetch("/api/documents", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Failed to load repository count",
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Failed to load repository count",
          );
        }

        const documents: ApiDocument[] =
          Array.isArray(result.documents)
            ? result.documents
            : [];

        const approvedDocuments = documents.filter(
          (document) =>
            (document.status || "").toUpperCase() ===
            "APPROVED",
        );

        setApprovedCount(
          approvedDocuments.length,
        );
      } catch (error) {
        console.error(
          "Sidebar repository count error:",
          error,
        );

        setApprovedCount(null);
      }
    }

    loadApprovedCount();

    // Refresh the number periodically so approval changes
    // are reflected without manually refreshing the page.
    const interval = setInterval(
      loadApprovedCount,
      30000,
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="hidden min-h-screen border-r border-neutral-200 bg-white lg:flex lg:flex-col">
      {/* BRAND */}
      <div className="flex h-16 items-center border-b border-neutral-200 px-5">
        <Link href="/" className="block">
          <div className="text-[15px] font-semibold tracking-tight">
            PolarConnect
          </div>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            POLAR KNOWLEDGE SYSTEM
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-3 py-5">
        <SectionLabel>
          Workspace
        </SectionLabel>

        <nav className="space-y-1">
          {primaryLinks.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href ||
              (link.href !== "/" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex h-10 items-center gap-3 rounded-sm px-2 text-sm transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" />

                <span>{link.name}</span>

                {/* LIVE REPOSITORY COUNT */}
                {link.name === "Repository" && (
                  <span
                    className={`ml-auto font-mono text-[9px] ${
                      active
                        ? "text-neutral-400"
                        : "text-neutral-400"
                    }`}
                  >
                    {approvedCount === null
                      ? "—"
                      : approvedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* INTELLIGENCE */}
        <SectionLabel className="mt-8">
          Intelligence
        </SectionLabel>

        <nav className="space-y-1">
          {intelligenceLinks.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href ||
              pathname.startsWith(
                link.href + "/",
              );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex h-10 items-center gap-3 rounded-sm px-2 text-sm transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" />

                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ADMINISTRATION */}
        <SectionLabel className="mt-8">
          Administration
        </SectionLabel>

        <Link
          href="/admin"
          className={`flex h-10 items-center gap-3 rounded-sm px-2 text-sm transition-colors ${
            pathname === "/admin" ||
            pathname.startsWith("/admin/")
              ? "bg-neutral-100 text-black"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
          }`}
        >
          <Settings className="h-4 w-4 stroke-[1.5]" />

          <span>Admin Console</span>
        </Link>
      </div>

      {/* SYSTEM STATUS */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse bg-emerald-500" />

          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            System Operational
          </span>
        </div>

        <div className="mt-2 font-mono text-[9px] text-neutral-400">
          POLARCONNECT / v0.1
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-2 px-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400 ${className}`}
    >
      {children}
    </div>
  );
}