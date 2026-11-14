import type { Metadata } from "next";
import "./globals.css";
import "./review.css";

export const metadata: Metadata = {
  title: "Kashi Riverside Stay | Culture in Every Stay",
  description: "A warm, cultural stay in Sonarpura, Varanasi.",
  icons: { icon: "/assets/krs-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
