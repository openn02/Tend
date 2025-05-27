import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/contexts/RoleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tend - AI Wellbeing Assistant",
  description: "Privacy-first AI wellbeing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <RoleProvider>
          <div className="min-h-full bg-gray-50">
            {children}
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
