import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-brutal",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QueueLive",
  description: "Живая загруженность очередей на карте",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${plexMono.variable} h-full antialiased`}>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
