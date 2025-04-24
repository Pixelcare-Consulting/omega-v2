'use client';

import React, { useState, useEffect } from 'react';
import { ExtendedUser } from '@/auth';
import DashboardContent from './dashboard-content';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardContentWrapperProps {
  user?: ExtendedUser;
}

export default function DashboardContentWrapper({ user }: DashboardContentWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Simulate loading state for smoother transition
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <DashboardContentSkeleton />;
  }

  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  return <DashboardContent user={user} />;
}

// Loading skeleton for the dashboard content
function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="mt-1 h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 