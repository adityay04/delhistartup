import type { Metadata } from "next";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Delhi Startup Map",
  description:
    "The definitive interactive map of Delhi NCR's startup ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrument.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#fcfcfd] dark:bg-[#09090b] text-[#141314] dark:text-[#fafafa] transition-colors duration-500`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
