"use client";

import { createContext, useContext, useState, useEffect } from "react";

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
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [registrationData, setRegistrationData] =
    useState<UserRegistrationData>({});
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("registrationData");
    if (stored) {
      setRegistrationData(JSON.parse(stored));
    }

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const updateRegistrationData = (data: Partial<UserRegistrationData>) => {
    const updated = { ...registrationData, ...data };
    setRegistrationData(updated);
    localStorage.setItem("registrationData", JSON.stringify(updated));
  };

  const clearRegistrationData = () => {
    setRegistrationData({});
    localStorage.removeItem("registrationData");
  };

  const updateUserData = (data: Partial<UserData>) => {
    const updated = { ...userData, ...data };
    setUserData(updated);
    localStorage.setItem("userData", JSON.stringify(updated));
  };

  const handleSetUserData = (user: UserData | null) => {
    setUserData(user);
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  };

  return (
    <UserContext.Provider
      value={{
        registrationData,
        userData,
        updateRegistrationData,
        clearRegistrationData,
        setUserData: handleSetUserData,
        updateUserData,
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
