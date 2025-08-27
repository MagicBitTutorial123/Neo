"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InstantRouteBlocker() {
  const [isBlocking, setIsBlocking] = useState(true);

  useEffect(() => {
    // Block immediately on mount
    blockUnauthorizedAccess();
    
    // Block on every URL change
    const handleUrlChange = () => {
      blockUnauthorizedAccess();
    };

    // Block on browser navigation
    const handlePopState = () => {
      blockUnauthorizedAccess();
    };

    // Block on page focus (user switching tabs)
    const handleFocus = () => {
      blockUnauthorizedAccess();
    };

    // Block on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        blockUnauthorizedAccess();
      }
    };

    // Add all event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor URL changes every 50ms (very fast)
    const urlCheckInterval = setInterval(() => {
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        blockUnauthorizedAccess();
      }
    }, 50);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(urlCheckInterval);
    };
  }, []);

  const blockUnauthorizedAccess = async () => {
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
        // Check auth immediately
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 INSTANT BLOCK: Unauthorized access to:", currentPath);
          // Use immediate redirect - no delay
          window.location.replace("/");
          return;
        }
      }
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      // On error, block access immediately
      window.location.replace("/");
    }
  };

  // Show blocking overlay while checking
  if (isBlocking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  return null;
}
