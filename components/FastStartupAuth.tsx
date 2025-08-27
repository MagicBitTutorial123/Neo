"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface FastStartupAuthProps {
  children: React.ReactNode;
}

export default function FastStartupAuth({ children }: FastStartupAuthProps) {
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Single fast auth check on startup
    checkAuthOnce();
  }, []);

  const checkAuthOnce = async () => {
    try {
      setIsChecking(true);
      
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        // Quick auth check for protected routes
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Fast block: Unauthorized access to:", currentPath);
          window.location.replace("/");
          return;
        }
      }
      
      // Auth check passed or public route
      setIsReady(true);
      setIsChecking(false);
      
    } catch (err) {
      console.error("❌ Fast auth check failed:", err);
      // On error, allow access (don't block startup)
      setIsReady(true);
      setIsChecking(false);
    }
  };

  // Show minimal loading state
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-lg text-[#222E3A]">Starting up...</p>
        </div>
      </div>
    );
  }

  // Render children when ready
  return <>{children}</>;
}
