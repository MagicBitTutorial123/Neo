// This is your server component layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { SidebarProvider } from "@/context/SidebarContext";
import SimpleRouteProtection from "@/components/SimpleRouteProtection";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "BuddyNeo",
  description: "BuddyNeo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <UserProvider>
          <SidebarProvider>
            <SimpleRouteProtection>
              {children}
            </SimpleRouteProtection>
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
