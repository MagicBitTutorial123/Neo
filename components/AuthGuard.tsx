"use client";

import { useCallback, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = "/" }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  },);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user || error) {
        console.log("❌ User not authenticated, redirecting to:", redirectTo);
        console.log("🚫 Attempted to access protected route:", window.location.pathname);
        
        // Use hard redirect to prevent back navigation
        window.location.href = redirectTo;
        return;
      }
      
      // User is authenticated
      console.log("✅ User authenticated, allowing access");
      setIsAuthenticated(true);
      
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      window.location.href = redirectTo;
    } finally {
      setLoading(false);
    }
  }, [redirectTo]);

  // Additional protection: check on every render
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log("🚫 Unauthorized access detected, redirecting to:", redirectTo);
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-lg text-[#222E3A]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // This should not render as we redirect above, but just in case
  return null;
}
