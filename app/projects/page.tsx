"use client";
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

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <SideNavbar />
      <main className="flex-1 flex flex-col items-start px-12 py-12 overflow-x-hidden">
        {/* Project of the week */}
        {projectOfTheWeek && (
          <div
            className="w-full max-w-6xl flex flex-row items-stretch border border-[#E0E6ED] rounded-3xl bg-white mb-12"
            style={{ minHeight: 240 }}
          >
            <div className="flex flex-col justify-center flex-1 pl-8">
              <div className="text-3xl md:text-4xl font-extrabold text-[#222E3A] mb-2">
                {projectOfTheWeek.title}
              </div>
              <div className="text-lg font-bold text-[#888] mb-2">
                {projectOfTheWeek.subtitle}
              </div>
              <div className="text-base text-[#222E3A] mb-6">
                {projectOfTheWeek.description}
              </div>
              <LetsGoButton
                style={{
                  width: 300,
                  minWidth: 170,
                  height: 48,
                  minHeight: 48,
                  fontSize: 18,
                  justifyContent: "center",
                }}
              >
                Explore Now
              </LetsGoButton>
            </div>
            <div className="flex-shrink-0 h-full w-[450px] relative overflow-hidden rounded-r-3xl">
              <Image
                src={projectOfTheWeek.image}
                alt={projectOfTheWeek.title}
                fill
                className="object-cover h-full w-full"
                style={{
                  borderTopRightRadius: 24,
                  borderBottomRightRadius: 24,
                  display: "block",
                }}
              />
            </div>
          </div>
        )}
        {/* Explore other projects */}
        <div className="w-full max-w-6xl">
          <div className="text-2xl md:text-3xl font-extrabold text-[#22AEEF] mb-6 mt-2">
            Explore other projects
          </div>
          <ProjectsCarousel projects={otherProjects} />
        </div>
      </main>
    </div>
  );
}

// Hide scrollbar utility (add to globals.css if not present):
// .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
// .hide-scrollbar::-webkit-scrollbar { display: none; }
