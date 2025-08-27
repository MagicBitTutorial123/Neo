"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function SimpleAuthGuard({ children, redirectTo = "/" }: SimpleAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Single auth check on mount
    checkAuthOnce();
  }, []);

  const checkAuthOnce = async () => {
    try {
      setIsChecking(true);
      
      // Simple auth check
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user || error) {
        console.log("🚫 Simple block: User not authenticated");
        window.location.replace(redirectTo);
        return;
      }
      
      // User is authenticated
      setIsAuthenticated(true);
      setIsChecking(false);
      
    } catch (err) {
      console.error("❌ Simple auth check failed:", err);
      window.location.replace(redirectTo);
    }
  };

  // Show minimal loading
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FC] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-lg text-[#222E3A]">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
