import type { Metadata } from "next";
import { DM_Sans, Kalam, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Body text — the default typeface across the app.
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// Sidebar and brand marks. Kalam is not a variable font, so weights are explicit.
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
});

// Profile usernames, set in italic.
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Witness",
  description: "Compare with your past self, not others.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        dmSans.variable,
        kalam.variable,
        lora.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}