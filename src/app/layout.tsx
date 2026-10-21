import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neural Drive — Chidera Emmanuel",
  description: "An accessible driving simulator concept with scenic routes, adaptable controls, and a personal journey journal. By Chidera Emmanuel.",
  openGraph: {
    title: "Neural Drive — Chidera Emmanuel",
    description: "Your route. Your pace. Explore an accessible driving simulator concept by Chidera Emmanuel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="experience-root antialiased">{children}</body>
    </html>
  );
}
