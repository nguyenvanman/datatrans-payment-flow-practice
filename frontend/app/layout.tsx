import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datatrans Payment Demo",
  description: "Payment flow demo — Next.js App Router · FastAPI · PostgreSQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <span className="text-xl">💳</span>
            <span className="font-semibold text-gray-800">Datatrans Demo</span>
            <span className="ml-auto text-xs text-gray-400">
              Next.js App Router · FastAPI · PostgreSQL
            </span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
