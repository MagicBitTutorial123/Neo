"use client";
import SideNavbar from "@/components/SideNavbar";

export default function DemoPage() {
  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      <SideNavbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">Demo</h1>
          <p className="text-lg text-gray-600">Demo page coming soon!</p>
        </div>
      </div>
    </div>
  );
} 