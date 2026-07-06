import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainSideBar } from "@/components/MainSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {GameContextProvider} from "@/hooks/game-context";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joutes Tools",
  description: "Un ensemble d'outils pour les jeux de cartes à collectionner et les jeux de sociétés, créés par les équipes de Joutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <GameContextProvider>
          <SidebarProvider>
            <MainSideBar />
            <main className="w-full">
              <Link href="https://joutes.app/games">
                <div className="bg-primary text-primary-foreground p-2 text-lg font-bold font-mono">
                  Joutes tools are now available directly inside the main Joutes app. Click here to go the games registry.
                </div>
              </Link>
              <div className=" p-4">
                <SidebarTrigger />
                {children}
              </div>
            </main>
          </SidebarProvider>
        </GameContextProvider>
      </body>
    </html>
  );
}
