import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Telugu News Summarization Assistant - Editorial Workspace",
  description: "Convert long-form Telugu news articles into concise, reader-friendly summaries, key highlights, digital headlines, and WhatsApp-ready promotional content instantly using Generative AI.",
  keywords: ["Telugu News Summarizer", "AI Newsroom Assistant", "Telugu NLP", "Eenadu News AI", "Namaste Telangana Simulator", "Telugu AI Summarization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
