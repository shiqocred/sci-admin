import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ToastProvider } from "@/providers/toast-provider";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inside Sehat Cerah Indonesia",
  description: "Inside Only",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <QueryProviders>
            <NuqsAdapter>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
              >
                <ToastProvider />
                {children}
              </ThemeProvider>
            </NuqsAdapter>
          </QueryProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
