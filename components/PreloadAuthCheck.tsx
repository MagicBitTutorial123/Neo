"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PreloadAuthCheckProps {
  children: React.ReactNode;
}

export default function PreloadAuthCheck({ children }: PreloadAuthCheckProps) {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check auth immediately before anything renders
    checkAuthPreload();
  }, []);

  const checkAuthPreload = async () => {
    try {
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        // Check authentication before rendering anything
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 PRELOAD BLOCK: Unauthorized access to:", currentPath);
          // Redirect immediately before any content shows
          window.location.replace("/");
          return;
        }
        
        // User is authorized
        setIsAuthorized(true);
      } else {
        // Public route, allow access
        setIsAuthorized(true);
      }
      
      setIsAuthChecked(true);
      
    } catch (err) {
      console.error("❌ Preload auth check failed:", err);
      // On error, redirect to signin
      window.location.replace("/");
    }
  };

  // Show blocking overlay while checking auth
  if (!isAuthChecked || !isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Only render children after auth is verified
  return <>{children}</>;
}
