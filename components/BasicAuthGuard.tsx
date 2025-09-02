"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface BasicAuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function BasicAuthGuard({ children, redirectTo = "/" }: BasicAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Single auth check on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user || error) {
        console.log("🚫 User not authenticated");
        window.location.replace(redirectTo);
        return;
      }
      
      setIsAuthenticated(true);
      setIsChecking(false);
      
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      window.location.replace(redirectTo);
    }
  };

  // Show loading
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