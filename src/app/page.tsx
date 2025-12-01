'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from '@/components/landing-page';
import DashboardContent from './dashboard/DashboardContent';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // In a real app, this would check a token or session
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);

  if (isLoggedIn === null) {
    return (
        <div className="flex items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-4xl space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            </div>
      </div>
    );
  }
  
  return isLoggedIn ? <DashboardContent /> : <LandingPage />;
}
