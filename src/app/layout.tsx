import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neural Drive — Chidera Emmanuel",
  description: "What if the next move began in your mind? An interactive exploration of intention and motion by Chidera Emmanuel.",
  openGraph: {
    title: "Neural Drive — Chidera Emmanuel",
    description: "Hands at rest. Possibility in motion. Step inside a mind-controlled driving concept.",
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
