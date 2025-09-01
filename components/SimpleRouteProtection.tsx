"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SimpleRouteProtectionProps {
  children: React.ReactNode;
}

export default function SimpleRouteProtection({ children }: SimpleRouteProtectionProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple auth check on mount only
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentPath = window.location.pathname;
      
      // Routes that should be excluded from auth checks (OAuth flow, signup, etc.)
      const excludedRoutes = [
        '/auth/callback',
        '/signup',
        '/signin',
        '/',
        '/Land'
      ];
      
      // Check if current path should be excluded
      const isExcludedRoute = excludedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isExcludedRoute) {
        console.log("🔓 Excluded route, allowing access:", currentPath);
        setIsReady(true);
        return;
      }
      
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Access blocked:", currentPath);
          window.location.replace("/");
          return;
        }
      }
      
      setIsReady(true);
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      // On error, allow access to prevent blocking
      setIsReady(true);
    }
  };

  // Show loading while checking
  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-lg text-[#222E3A]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
