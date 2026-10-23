import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chidera Emmanuel | Websites & Product Development",
  description: "Business websites, product catalogues and interactive prototypes by Chidera Emmanuel. Explore services and selected work.",
  openGraph: {
    title: "Chidera Emmanuel | Websites & Product Development",
    description: "Thoughtful websites and working prototypes for businesses. Explore Chidera Emmanuel’s services and LocHire.",
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
