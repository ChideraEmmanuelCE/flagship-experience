import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flagship Experience",
  description: "Ideas become reality. Thinking becomes motion.",
  openGraph: {
    title: "Flagship Experience",
    description: "A glimpse of someone's future.",
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
