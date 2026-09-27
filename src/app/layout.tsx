import type { Metadata } from "next";
import "./globals.css";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileNav from "@/components/layout/MobileNav";

export const metadata: Metadata = {
  title: "PolarConnect",
  description:
    "Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white text-black">
          <div className="grid min-h-screen lg:grid-cols-[220px_minmax(0,1fr)]">
            <Sidebar />

            <div className="min-w-0">
              <Topbar />

              <main className="pb-16 lg:pb-0">{children}</main>
            </div>
          </div>

          <MobileNav />
        </div>
      </body>
    </html>
  );
}