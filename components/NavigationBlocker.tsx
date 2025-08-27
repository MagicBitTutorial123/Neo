"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NavigationBlocker() {
  useEffect(() => {
    // Block browser back/forward navigation to protected routes
    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        // Check authentication immediately
        checkAuthAndRedirect();
      }
    };

    // Block direct URL access
    const handleBeforeUnload = () => {
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute) {
        checkAuthAndRedirect();
      }
    };

    // Block manual URL changes
    const handleUrlChange = () => {
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const protectedRoutes = [
          '/home', '/missions', '/profile', '/settings', 
          '/playground', '/playground-unlocked', '/projects', '/demo'
        ];
        
        const isProtectedRoute = protectedRoutes.some(route => 
          currentPath.startsWith(route)
        );
        
        if (isProtectedRoute) {
          checkAuthAndRedirect();
        }
      }, 100);
    };

    const checkAuthAndRedirect = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Unauthorized navigation detected, redirecting to signin");
          // Use hard redirect to prevent back navigation
          window.location.href = "/";
          return;
        }
      } catch (err) {
        console.error("❌ Auth check failed during navigation:", err);
        window.location.href = "/";
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Monitor URL changes
    let currentUrl = window.location.href;
    const urlCheckInterval = setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        handleUrlChange();
      }
    }, 100);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(urlCheckInterval);
    };
  }, []);

  return null; // This component doesn't render anything
}
