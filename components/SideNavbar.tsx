"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import smallLogo from "@/assets/logo-small.png"
import sideLogo from "@/assets/side-logo.png"

export default function SideNavbar({
  avatar,
  name,
setsidebarCollapsed, 
sidebarCollapsed, 
}: {
  avatar?: string;
  name?: string;
  setsidebarCollapsed?: React.Dispatch<React.SetStateAction<boolean>>
  sidebarCollapsed?: boolean;
}) {
  const { registrationData, userData } = useUser();

  // Use provided props or fall back to context data
  const userAvatar =
    avatar || userData?.avatar || registrationData.avatar || "/User.png";
  const userName = name || userData?.name || registrationData.name || "User";
  const pathname = usePathname();

  // Use userData from context for mission completion status
  const hasCompletedMission2 = userData?.hasCompletedMission2 || false;

  const navItems = [
    {
      icon: "/home-icon.png",
      label: "Home",
      href: "/home",
      active: pathname === "/home",
    },
    {
      icon: "/missions-icon.png",
      label: "Missions",
      href: "/missions",
      active: pathname === "/missions",
    },
    hasCompletedMission2
      ? {
          icon: "/playground-active.png",
          label: "Playground",
          href: "/playground",
          active: pathname === "/playground",
        }
      : {
          icon: "/playground-icon-dissabled.png",
          label: "Playground",
          href: "#",
          disabled: true,
        },
    {
      icon: "/demo-icon.png",
      label: "Demo",
      href: "/demo",
      active: pathname === "/demo",
    },
    {
      icon: "/projects-icon.png",
      label: "Projects",
      href: "/projects",
      active: pathname === "/projects",
    },
  ];

  return (
    <aside
      className={`flex flex-col justify-between items-center h-screen ${
        sidebarCollapsed ? "w-[80px]" : "w-[260px]"
      } bg-[#F8F9FC] rounded-r-3xl py-6 px-2 shadow-2xl z-50`}
      style={{
        position: "relative",zIndex:10
      }}
    >
      {/* Corner fillers to prevent background showing through rounded corners */}
      <div
        className="absolute top-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderTopRightRadius: "24px",
          borderBottomLeftRadius: "24px",
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-[#F8F9FC]"
        style={{
          borderBottomRightRadius: "24px",
          borderTopLeftRadius: "24px",
          zIndex: 1,
        }}
      />

      {/* Logo at the top */}
      <div
        className={`mb-8 w-full flex justify-center ${
          sidebarCollapsed ? "px-0" : "px-2"
        }`}
        style={{ zIndex: 2 }}
      >
        <div
          className={`bg-white rounded-2xl flex items-center justify-center ${
            sidebarCollapsed ? "w-14 h-14" : "w-[150px] h-[50px]"
          }`}
        >
          <Image
            src={sidebarCollapsed ? smallLogo : sideLogo}
            alt="BuddyNeo Logo"
          />
        </div>
      </div>
      {/* Navigation icons - centered vertically */}
      <div
        className="flex-1 flex flex-col justify-center items-center w-full"
        style={{ zIndex: 2 }}
      >
        <nav
          className={`flex flex-col ${
            sidebarCollapsed ? "gap-4" : "gap-6"
          } items-start w-full ${sidebarCollapsed ? "pl-2" : "pl-8"}`}
        >
          {navItems.map((item) =>
            item.disabled ? (
              <div
                key={item.label}
                className={`flex flex-row items-center gap-3 cursor-not-allowed select-none ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={25}
                  height={25}
                  style={{ filter: "grayscale(1)", opacity: 1 }}
                />
                {!sidebarCollapsed && (
                  <span
                    className="text-base font-semibold"
                    style={{ color: "#BDC8D5" }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ) : item.active ? (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-row items-center gap-3 ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3 rounded-2xl ${
                  item.active
                    ? "border border-[#00AEEF] bg-white shadow-sm"
                    : "hover:bg-[#F0F4F8] transition-colors"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold text-[#222E3A]">
                    {item.label}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-row items-center gap-3 ${
                  sidebarCollapsed ? "w-12 justify-center px-0" : "w-[80%] px-4"
                } py-3 rounded-2xl hover:bg-[#F0F4F8] transition-colors`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                />
                {!sidebarCollapsed && (
                  <span className="text-base font-semibold text-[#222E3A]">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>
      {/* User/avatar section at the bottom */}
      <div
        className="w-full flex flex-col items-center mb-2"
        style={{ zIndex: 2 }}
      >
        <Link
          href="/profile"
          className={`flex flex-row items-center justify-between ${
            sidebarCollapsed ? "w-12 px-0" : "w-[90%] px-3"
          } bg-white rounded-2xl py-2 mt-2 shadow-sm hover:bg-[#F0F4F8] transition-colors`}
        >
          <div className="flex flex-row items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#FFFBEA] flex items-center justify-center overflow-hidden">
              <Image
                src={userAvatar}
                alt="User Avatar"
                width={36}
                height={36}
              />
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-[#222E3A]">
                {userName}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E0E0E0] transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="2" fill="#888" />
                <circle cx="10" cy="10" r="2" fill="#888" />
                <circle cx="16" cy="10" r="2" fill="#888" />
              </svg>
            </button>
          )}
        </Link>
      </div>
      {/* Vertical divider/handle */}
      <button
        className={`absolute top-1/2 right-0 -translate-y-1/2 w-3 h-12 flex items-center justify-center group transition-transform ${
          sidebarCollapsed ? "scale-x-[-1]" : ""
        }`}
        onClick={() => setsidebarCollapsed((c) => !c)}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          outline: "none",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        <div className="w-2 h-8 bg-[#E0E6ED] rounded-full shadow-inner group-hover:bg-[#00AEEF] transition-colors" />
      </button>
    </aside>
  );
}
