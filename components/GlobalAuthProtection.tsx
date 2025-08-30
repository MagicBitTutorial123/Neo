"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface GlobalAuthProtectionProps {
  children: React.ReactNode;
}

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/home',
  '/missions',
  '/profile',
  '/profile-completion',
  '/settings',
  '/playground',
  '/playground-unlocked',
  '/projects',
  '/demo'
];

export default function GlobalAuthProtection({ children }: GlobalAuthProtectionProps) {
  const pathname = usePathname();

  useEffect(() => {
    checkRouteAccess();
  }, [pathname]);

  const checkRouteAccess = async () => {
    try {
      // Check if current route is protected
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname.startsWith(route)
      );

      // If it's a protected route, check authentication
      if (isProtectedRoute) {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Unauthorized access to protected route:", pathname);
          console.log("🔄 Redirecting to signin page");
          
          // Use hard redirect to prevent back navigation
          window.location.href = "/";
          return;
        }
        
        console.log("✅ Authorized access to protected route:", pathname);
      }

      // If it's the root path and user is authenticated, redirect to home
      if (pathname === "/") {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          console.log("✅ User already authenticated, redirecting to home");
          // Use hard redirect to prevent back navigation
          window.location.href = "/home";
          return;
        }
      }

    } catch (err) {
      console.error("❌ Route access check failed:", err);
      // On error, redirect to signin for safety
      if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        window.location.href = "/";
      }
    }
  };

  return <>{children}</>;
}
