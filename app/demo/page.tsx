"use client";
import SideNavbar from "@/components/SideNavbar";
import { useSidebar } from "@/context/SidebarContext";

export default function DemoPage() {
  const { sidebarCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-[#F8F9FC]">
      <SideNavbar />
      <div
        className="flex-1 flex items-center justify-center transition-all duration-300 ease-in-out"
        style={{ marginLeft: "0px" }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">Demo</h1>
          <p className="text-lg text-gray-600 mb-8">
            Demo page for testing components!
          </p>

          {/* Demo Content */}
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mt-4">
              Demo page is ready for testing components
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
