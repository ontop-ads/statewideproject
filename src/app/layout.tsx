import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Statewide Stone Care | Financial & Leads Control",
  description: "Advanced lead management platform for Stonecare services",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden`}>
        {session && <Sidebar session={session} />}
        <main className="flex-1 overflow-y-auto bg-marble p-4 pb-24 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
