import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movexum Impact Navigator",
  description: "Internt beslutsstöd för hållbarhets- och impactbedömning av startups."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
