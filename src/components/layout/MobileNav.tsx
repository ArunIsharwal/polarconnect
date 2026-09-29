"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  Globe2,
  Home,
  Image,
} from "lucide-react";

const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Library", href: "/repository", icon: BookOpen },
  { name: "Expedition", href: "/expeditions", icon: Globe2 },
  { name: "Data", href: "/datasets", icon: Database },
  { name: "Media", href: "/media", icon: Image },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-neutral-200 bg-white lg:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex h-14 flex-col items-center justify-center gap-1 transition-colors hover:bg-neutral-50 ${
              active ? "text-black" : "text-neutral-400"
            }`}
          >
            <Icon className="h-4 w-4 stroke-[1.5]" />

            <span className="font-mono text-[8px] uppercase tracking-widest">
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}