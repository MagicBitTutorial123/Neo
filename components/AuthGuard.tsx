"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = "/" }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user || error) {
        console.log("❌ User not authenticated, redirecting to:", redirectTo);
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
  };

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
