"use client";
import { useState } from "react";
import SideNavbar from "@/components/SideNavbar";
import Image from "next/image";
import LetsGoButton from "@/components/LetsGoButton";
import ProjectsCarousel from "@/components/ProjectsCarousel";

const projects = [
  {
    id: 1,
    title: "Boxing Champion",
    subtitle: "Project of the week",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/project-image-4.png",
    projectOfTheWeek: true,
  },
  {
    id: 2,
    title: "AI & Voice Commands",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/project-image-1.png",
  },
  {
    id: 3,
    title: "Make a chess champion",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/project-image-2.png",
  },
  {
    id: 4,
    title: "Crazy Hip-hop Robot",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/project-image-3.png",
  },
  {
    id: 5,
    title: "Boxing Champ",
    description: "Lorem ipsum dolor sit amet consectetur.",
    image: "/project-image-4.png",
  },
];

export default function ProjectsPage() {
  const projectOfTheWeek = projects.find((p) => p.projectOfTheWeek);
  const otherProjects = projects.filter((p) => !p.projectOfTheWeek);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <SideNavbar onCollapse={setSidebarCollapsed} />
      <main
        className="flex-1 flex flex-col items-start px-4 lg:px-12 py-6 lg:py-8 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? "80px" : "260px",
        }}
      >
        {/* Project of the week */}
        {projectOfTheWeek && (
          <div
            className="w-full flex flex-col lg:flex-row items-stretch border border-[#E0E6ED] rounded-2xl lg:rounded-3xl bg-[#F8F9FC] mb-8 lg:mb-12 transition-all duration-300 ease-in-out"
            style={{
              minHeight: 280,
              maxWidth: sidebarCollapsed
                ? "calc(100vw - 80px - 32px)"
                : "calc(100vw - 260px - 32px)",
            }}
          >
            <div className="flex flex-col justify-center flex-1 p-6 lg:pl-8">
              <div className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#222E3A] mb-2">
                {projectOfTheWeek.title}
              </div>
              <div className="text-base lg:text-lg font-bold text-[#888] mb-2">
                {projectOfTheWeek.subtitle}
              </div>
              <div className="text-sm lg:text-base text-[#222E3A] mb-4 lg:mb-6">
                {projectOfTheWeek.description}
              </div>
              <LetsGoButton
                style={{
                  width: 240,
                  minWidth: 170,
                  height: 44,
                  minHeight: 44,
                  fontSize: 16,
                  justifyContent: "center",
                }}
              >
                Explore Now
              </LetsGoButton>
            </div>
            <div className="flex-shrink-0 h-48 lg:h-full w-full lg:w-[450px] relative overflow-hidden rounded-b-2xl lg:rounded-r-3xl lg:rounded-b-none">
              <Image
                src={projectOfTheWeek.image}
                alt={projectOfTheWeek.title}
                fill
                className="object-cover h-full w-full"
                style={{
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  display: "block",
                }}
              />
            </div>
          </div>
        )}
        {/* Explore other projects */}
        <div
          className="w-full flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxWidth: sidebarCollapsed
              ? "calc(100vw - 80px - 32px)"
              : "calc(100vw - 260px - 32px)",
          }}
        >
          <div className="text-xl lg:text-2xl xl:text-3xl font-extrabold text-[#22AEEF] mb-4">
            Explore other projects
          </div>
          <div className="flex-1 overflow-hidden">
            <ProjectsCarousel
              projects={otherProjects}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Hide scrollbar utility (add to globals.css if not present):
// .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
// .hide-scrollbar::-webkit-scrollbar { display: none; }
