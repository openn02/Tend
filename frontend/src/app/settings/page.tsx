"use client";
import dynamic from 'next/dynamic';

const SettingsPage = dynamic(() => import('./SettingsPage'), { ssr: false });

export default function Page() {
  return <SettingsPage />;
} 