import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pick one, love",
  description: "A cozy little claw machine for picking dinner and finding gifts.",
  // A personal gift: the link is for her, not for search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F4F1E1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" className={`${nunito.variable} h-full antialiased`}>
    <body className="h-full overflow-hidden font-sans">{children}</body>
  </html>
);

export default RootLayout;
