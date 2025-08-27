"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface RouteProtectionProps {
  children: React.ReactNode;
}

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/home',
  '/missions',
  '/profile',
  '/settings',
  '/playground',
  '/playground-unlocked',
  '/projects',
  '/demo'
];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/signup',
  '/signin'
];

export default function RouteProtection({ children }: RouteProtectionProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkRouteAccess();
    
    // Listen for browser navigation events
    const handlePopState = () => {
      setTimeout(checkRouteAccess, 100);
    };

    const handleBeforeUnload = () => {
      // Check auth before page unload
      checkRouteAccess();
    };

    // Add event listeners for navigation
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check auth on every route change
    const handleRouteChange = () => {
      checkRouteAccess();
    };

    // Listen for custom route changes
    window.addEventListener('routeChange', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [pathname]);

  const checkRouteAccess = async () => {
    try {
      const currentPath = window.location.pathname;
      
      // Check if current route is protected
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        currentPath.startsWith(route)
      );

      // If it's a protected route, check authentication
      if (isProtectedRoute) {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!user || error) {
          console.log("🚫 Unauthorized access to protected route:", currentPath);
          console.log("🔄 Redirecting to signin page");
          
          // Use hard redirect to prevent back navigation
          window.location.href = "/";
          return;
        }
        
        console.log("✅ Authorized access to protected route:", currentPath);
      }

      // If it's the root path and user is authenticated, redirect to home
      if (currentPath === "/") {
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
      const currentPath = window.location.pathname;
      if (PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
        window.location.href = "/";
      }
    }
  };

  // Additional protection: check on every render
  useEffect(() => {
    // Check auth immediately on component mount
    checkRouteAccess();
    
    // Set up interval to check auth every few seconds
    const interval = setInterval(checkRouteAccess, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
