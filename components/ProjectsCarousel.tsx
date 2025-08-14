import Image from "next/image";
import { useState, MouseEvent } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  faded?: boolean;
}

interface ProjectsCarouselProps {
  projects: Project[];
  sidebarCollapsed?: boolean;
}

const CARDS_PER_VIEW_DESKTOP = 3;
const CARDS_PER_VIEW_TABLET = 2;
const CARDS_PER_VIEW_MOBILE = 1;

export default function ProjectsCarousel({
  projects,
  sidebarCollapsed = false,
}: ProjectsCarouselProps) {
  const [index, setIndex] = useState(0);

  // Responsive cards per view
  const getCardsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return CARDS_PER_VIEW_DESKTOP;
      if (window.innerWidth >= 768) return CARDS_PER_VIEW_TABLET;
      return CARDS_PER_VIEW_MOBILE;
    }
    return CARDS_PER_VIEW_DESKTOP;
  };

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, projects.length - cardsPerView);

  const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((prev) => Math.min(prev + 1, maxIndex));
  };
  const handlePrev = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  // Responsive card width calculation
  const getCardWidth = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        return sidebarCollapsed ? 336 : 306; // Desktop
      }
      if (window.innerWidth >= 768) {
        return 280; // Tablet
      }
      return 280; // Mobile
    }
    return sidebarCollapsed ? 336 : 306;
  };

  const cardWidth = getCardWidth();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel viewport */}
      <div className="overflow-hidden w-full">
        <div
          className="flex gap-4 lg:gap-6 transition-transform duration-500"
          style={{
            transform: `translateX(-${index * cardWidth}px)`,
            willChange: "transform",
          }}
        >
          {projects.map((project: Project) => (
            <div
              key={project.id}
              className={`rounded-2xl bg-white shadow flex flex-col overflow-hidden ${
                project.faded
                  ? "opacity-40 grayscale"
                  : "hover:shadow-lg hover:shadow-[#00000022]"
              } transition-all duration-300 ease-in-out border border-[#E0E6ED] relative mb-6`}
              style={{
                minWidth: `${cardWidth - 16}px`,
                maxWidth: `${cardWidth - 16}px`,
              }}
            >
              <div className="relative w-full h-32 lg:h-40 bg-[#F5F7FA]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3 lg:p-4 flex flex-col flex-1">
                <div
                  className={`text-sm lg:text-base font-extrabold text-[#222E3A] mb-1 ${
                    project.faded ? "opacity-60" : ""
                  }`}
                >
                  {project.title}
                </div>
                <div
                  className={`text-[#555] text-xs lg:text-sm flex-1 ${
                    project.faded ? "opacity-60" : ""
                  }`}
                >
                  {project.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Fading gradient overlay and arrow */}
      {index < maxIndex && (
        <div
          className="absolute top-0 right-0 h-full flex items-center"
          style={{ width: 80, pointerEvents: "none" }}
        >
          <div
            className="absolute top-0 right-0 h-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(to right, rgba(248,249,252,0) 0%, white 80%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <button
            className="relative z-10 w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-[#E0E6ED] hover:bg-[#F5F7FA] transition"
            style={{ pointerEvents: "auto", right: 0, position: "absolute" }}
            onClick={handleNext}
            aria-label="Next"
          >
            <Image
              src="/carousel-arrow.png"
              alt="Next"
              width={20}
              height={20}
              className="lg:w-8 lg:h-8"
            />
          </button>
        </div>
      )}
      {/* Left arrow for previous, styled like right arrow */}
      {index > 0 && (
        <div
          className="absolute top-0 left-0 h-full flex items-center"
          style={{ width: 80, pointerEvents: "none" }}
        >
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(to left, rgba(248,249,252,0) 0%, white 80%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <button
            className="relative z-10 w-10 h-10 lg:w-14 lg:h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-[#E0E6ED] hover:bg-[#F5F7FA] transition"
            style={{
              pointerEvents: "auto",
              left: 0,
              position: "absolute",
              transform: "rotate(180deg)",
            }}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <Image
              src="/carousel-arrow.png"
              alt="Previous"
              width={20}
              height={20}
              className="lg:w-8 lg:h-8"
            />
          </button>
        </div>
      )}
    </div>
  );
}

// .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
// .hide-scrollbar::-webkit-scrollbar { display: none; }
