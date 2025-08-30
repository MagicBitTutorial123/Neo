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
      
      // Basic auth check only
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (user && !error) {
        console.log("✅ User authenticated");
        // Set basic user data
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