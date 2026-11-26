import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multimodal Impersonation & Fraud Analyzer | AegisAI",
  description: "Cyber-Forensic Command Center for Voice, Conversation, Message, URL, and Phone Fraud Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
