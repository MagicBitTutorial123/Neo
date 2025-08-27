"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UltraFastAuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function UltraFastAuthGuard({ children, redirectTo = "/" }: UltraFastAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check auth immediately on mount
    checkAuthImmediately();
    
    // Set up ultra-fast interval (every 100ms)
    const interval = setInterval(checkAuthImmediately, 100);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthImmediately = async () => {
    try {
      setIsChecking(true);
      
      // Check authentication status
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (!user || error) {
        console.log("🚫 ULTRA-FAST BLOCK: User not authenticated");
        console.log("🔄 Redirecting to:", redirectTo);
        
        // Use replace to prevent back navigation
        window.location.replace(redirectTo);
        return;
      }
      
      // User is authenticated
      setIsAuthenticated(true);
      setIsChecking(false);
      
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      window.location.replace(redirectTo);
    }
  };

  // Show blocking overlay while checking
  if (isChecking || !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  return <>{children}</>;
}
