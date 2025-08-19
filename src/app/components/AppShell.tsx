'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

interface AppSettings {
  apiUrl?: string;
  livekit_host?: string;
  livekit_api_key?: string;
  agentName?: string;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsAreValid, setSettingsAreValid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const essentialSettings = ['apiUrl', 'livekit_host', 'livekit_api_key', 'agentName'];
          const areSettingsMissing = !data || essentialSettings.some(key => !data[key]);

          if (areSettingsMissing) {
            setSettingsAreValid(false);
            if (pathname !== '/settings') {
              router.push('/settings');
            }
          } else {
            setSettingsAreValid(true);
          }
        } else {
          setSettingsAreValid(false);
          if (pathname !== '/settings') {
            router.push('/settings');
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setSettingsAreValid(false);
        if (pathname !== '/settings') {
          router.push('/settings');
        }
      } finally {
        setIsLoading(false);
      }
    }
    checkSettings();
  }, [pathname, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!settingsAreValid && pathname !== '/settings') {
    return <LoadingSpinner />;
  }

  if (!settingsAreValid && pathname === '/settings') {
    return (
      <main className="container mx-auto p-4">
        {children}
      </main>
    );
  }

  return (
    <>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold">
            Debt Collection Agency
          </div>
          <ul className="flex space-x-4">
            <li><Link href="/" className="text-gray-300 hover:text-white">Dashboard</Link></li>
            <li><Link href="/customers" className="text-gray-300 hover:text-white">Customers</Link></li>
            <li><Link href="/interactions" className="text-gray-300 hover:text-white">Interactions</Link></li>
            <li><Link href="/live" className="text-gray-300 hover:text-white">Live</Link></li>
            <li><Link href="/settings" className="text-gray-300 hover:text-white">Settings</Link></li>
          </ul>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </>
  );
}
