"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LightweightRouteMonitor() {
  useEffect(() => {
    // Lightweight route monitoring - only on navigation events
    const handlePopState = () => {
      setTimeout(checkRouteAccess, 100);
    };

    const handleBeforeUnload = () => {
      // Minimal check before unload
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        // Quick check without blocking
        supabase.auth.getUser().then(({ data: { user }, error }) => {
          if (!user || error) {
            // Don't block, just log
            console.log("🚫 Unauthorized access detected on navigation");
          }
        });
      }
    };

    // Add minimal event listeners
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const checkRouteAccess = async () => {
    try {
      const currentPath = window.location.pathname;
      const protectedRoutes = [
        '/home', '/missions', '/profile', '/settings', 
        '/playground', '/playground-unlocked', '/projects', '/demo'
      ];
      
      if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Route change blocked:", currentPath);
          window.location.replace("/");
        }
      }
    } catch (err) {
      console.error("❌ Route check failed:", err);
    }
  };

  // This component doesn't render anything
  return null;
}
