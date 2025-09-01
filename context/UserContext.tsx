"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

type UserRegistrationData = {
  name?: string;
  email?: string;
  age?: number;
  avatar?: string;
  password?: string;
  mpin?: string;
  fullPhone?: string;
  uid?: string;
  isVerified?: boolean;
};

type UserData = {
  _id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  age?: number;
  avatar?: string;
  phone?: string;
  firebaseUid?: string;
  isNewUser?: boolean;
  hasCompletedMission2?: boolean;
  hasCompletedMission3?: boolean;
  createdAt?: string;
  missionProgress?: number;
  xp?: number;
};

type UserContextType = {
  registrationData: UserRegistrationData;
  userData: UserData | null;
  updateRegistrationData: (data: Partial<UserRegistrationData>) => void;
  clearRegistrationData: () => void;
  setUserData: (user: UserData | null) => void;
  updateUserData: (data: Partial<UserData>) => void;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  checkingAuth: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [registrationData, setRegistrationData] =
    useState<UserRegistrationData>({});
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Load existing user data on mount
  useEffect(() => {
    // Simple auth check without complex profile loading
    checkAuthSimple();
  }, []);

  const checkAuthSimple = useCallback(async () => {
    try {
      setCheckingAuth(true);
      
      // Check if we're on a route that should be excluded from auth checks
      const currentPath = window.location.pathname;
      const excludedRoutes = [
        '/auth/callback',
        '/signup',
        '/signin',
        '/',
        '/Land'
      ];
      
      const isExcludedRoute = excludedRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isExcludedRoute) {
        console.log("🔓 UserContext: Excluded route, skipping auth check:", currentPath);
        setLoading(false);
        setCheckingAuth(false);
        return;
      }
      
      // Basic auth check only
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        console.log("✅ User authenticated");
        
        // Fetch user data from the user table
        try {
          const { data: userTableData, error: userTableError } = await supabase
            .from('user')
            .select('*')
            .eq('firebase_uid', user.id)
            .single();
          
          if (userTableData && !userTableError) {
            console.log("✅ User data fetched from table:", userTableData);
            // Use data from the user table
            const fullUserData: UserData = {
              _id: user.id,
              email: user.email || '',
              name: userTableData.name || userTableData.full_name || user.user_metadata?.full_name || '',
              phone: userTableData.phone || user.user_metadata?.phone || '',
              age: userTableData.age || user.user_metadata?.age || 0,
              avatar: userTableData.avatar || user.user_metadata?.avatar || '',
              isNewUser: userTableData.is_new_user || true,
              missionProgress: userTableData.mission_progress || 0,
              xp: userTableData.xp || 0,
              hasCompletedMission2: userTableData.has_completed_mission2 || false,
              hasCompletedMission3: userTableData.has_completed_mission3 || false,
              createdAt: userTableData.created_at || new Date().toISOString()
            };
            setUserData(fullUserData);
          } else {
            console.log("⚠️ No user table data found, using basic data");
            // Fallback to basic user data
            const basicUserData: UserData = {
              _id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || '',
              age: user.user_metadata?.age || 0,
              avatar: user.user_metadata?.avatar || '',
              isNewUser: true,
              missionProgress: 0,
              xp: 0,
              hasCompletedMission2: false,
              hasCompletedMission3: false,
              createdAt: new Date().toISOString()
            };
            setUserData(basicUserData);
          }
        } catch (tableError) {
          console.error("❌ Error fetching user table data:", tableError);
          // Fallback to basic user data
          const basicUserData: UserData = {
            _id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            age: user.user_metadata?.age || 0,
            avatar: user.user_metadata?.avatar || '',
            isNewUser: true,
            missionProgress: 0,
            xp: 0,
            hasCompletedMission2: false,
            hasCompletedMission3: false,
            createdAt: new Date().toISOString()
          };
          setUserData(basicUserData);
        }
        
        setLoading(false);
      } else {
        console.log("❌ User not authenticated");
        setLoading(false);
      }
      
      setCheckingAuth(false);
    } catch (err) {
      console.error("❌ Simple auth check failed:", err);
      setLoading(false);
      setCheckingAuth(false);
    }
  }, []);

  const updateRegistrationData = useCallback((data: Partial<UserRegistrationData>) => {
    const updated = { ...registrationData, ...data };
    setRegistrationData(updated);
    localStorage.setItem("registrationData", JSON.stringify(updated));
  }, [registrationData]);

  const clearRegistrationData = useCallback(() => {
    setRegistrationData({});
    localStorage.removeItem("registrationData");
  }, []);

  const updateUserData = useCallback((data: Partial<UserData>) => {
    const updated = { ...userData, ...data };
    setUserData(updated);
    localStorage.setItem("userData", JSON.stringify(updated));
  }, [userData]);

  const handleSetUserData = useCallback((user: UserData | null) => {
    setUserData(user);
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        // Fetch fresh user data from the user table
        const { data: userTableData, error: userTableError } = await supabase
          .from('user')
          .select('*')
          .eq('firebase_uid', user.id)
          .single();
        
        if (userTableData && !userTableError) {
          console.log("✅ User data refreshed from table:", userTableData);
          const fullUserData: UserData = {
            _id: user.id,
            email: user.email || '',
            name: userTableData.name || userTableData.full_name || user.user_metadata?.full_name || '',
            phone: userTableData.phone || user.user_metadata?.phone || '',
            age: userTableData.age || user.user_metadata?.age || 0,
            avatar: userTableData.avatar || user.user_metadata?.avatar || '',
            isNewUser: userTableData.is_new_user || true,
            missionProgress: userTableData.mission_progress || 0,
            xp: userTableData.xp || 0,
            hasCompletedMission2: userTableData.has_completed_mission2 || false,
            hasCompletedMission3: userTableData.has_completed_mission3 || false,
            createdAt: userTableData.created_at || new Date().toISOString()
          };
          setUserData(fullUserData);
        }
      }
    } catch (err) {
      console.error("❌ Error refreshing user data:", err);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        registrationData,
        userData,
        updateRegistrationData,
        clearRegistrationData,
        setUserData: handleSetUserData,
        updateUserData,
        refreshUserData,
        loading,
        checkingAuth,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};