"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/contexts/RoleContext";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const publicPaths = ['/login', '/register'];

    if (!token && !publicPaths.includes(pathname)) {
      router.push('/login');
    } else if (token && publicPaths.includes(pathname)) {
      router.push('/');
    }
  }, [pathname, router]);

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
