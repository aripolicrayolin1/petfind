'use client';

import { usePathname } from 'next/navigation';
import Header from './header';
import { VoiceAssistant } from '../voice-assistant';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noHeaderPaths = ['/signup', '/login'];
  const showHeader = !noHeaderPaths.some(path => pathname.startsWith(path)) && !pathname.endsWith('/print');
  
  // The logic for deciding whether to show Dashboard or LandingPage
  // belongs in `app/page.tsx`, not here. This component's only job
  // is to provide the general layout (header, main content).
  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <VoiceAssistant />
    </>
  );
}
