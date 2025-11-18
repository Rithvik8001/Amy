import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Lavishly_Yours } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lavishlyYours = Lavishly_Yours({
  weight: "400",
  variable: "--font-lavishly-yours",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amy - All your subscriptions in one place",
  description:
    "All your subscriptions in one place—because you're tired of surprises.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amy",
  },
  icons: {
    icon: [
      { url: "/assets/logo-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logo-12x12.png", sizes: "12x12", type: "image/png" },
    ],
    apple: [
      { url: "/assets/logo-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} ${lavishlyYours.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
