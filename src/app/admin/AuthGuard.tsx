
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayoutContent from './AdminLayoutContent';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function FullScreenLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md p-6 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthStatus(currentUser ? 'authenticated' : 'unauthenticated');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!user && pathname !== "/admin/login") {
        router.replace("/admin/login");
        return;
    }

    if (user && pathname === "/admin/login") {
        router.replace("/admin/dashboard");
    }
  }, [authStatus, pathname, user, router]);


  if (authStatus === 'loading') {
    return <FullScreenLoader />;
  }

  if (authStatus === 'authenticated' && user) {
    if (pathname === '/admin/login') {
        // Still loading the dashboard, show a loader to prevent flicker
        return <FullScreenLoader />;
    }
    return <AdminLayoutContent user={user}>{children}</AdminLayoutContent>;
  }
  
  // Unauthenticated
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Unauthenticated and not on login page, show loader while redirecting
  return <FullScreenLoader />;
}
