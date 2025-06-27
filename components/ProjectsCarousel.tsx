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
}

const CARDS_PER_VIEW = 3;

export default function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, projects.length - CARDS_PER_VIEW);

  const handleNext = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((prev) => Math.min(prev + 1, maxIndex));
  };
  const handlePrev = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative w-full">
      {/* Carousel viewport */}
      <div className="overflow-hidden w-full">
        <div
          className="flex gap-6 transition-transform duration-500"
          style={{
            transform: `translateX(-${index * 306}px)`, // 290px card + 16px gap
            willChange: "transform",
          }}
        >
          {projects.map((project: Project) => (
            <div
              key={project.id}
              className={`min-w-[290px] max-w-[290px] rounded-2xl bg-white shadow flex flex-col overflow-hidden ${
                project.faded ? "opacity-40 grayscale" : "hover:shadow-lg"
              } transition-shadow border border-[#E0E6ED] relative`}
            >
              <div className="relative w-full h-40 bg-[#F5F7FA]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div
                  className={`text-base font-extrabold text-[#222E3A] mb-1 ${
                    project.faded ? "opacity-60" : ""
                  }`}
                >
                  {project.title}
                </div>
                <div
                  className={`text-[#555] text-sm flex-1 ${
                    project.faded ? "opacity-60" : ""
                  }`}
                >
                  {project.description}
                </div>
              </div>
              {/* Next arrow for the last faded card (not needed in sliding version) */}
            </div>
          ))}
        </div>
      </div>
      {/* Fading gradient overlay and arrow */}
      {index < maxIndex && (
        <div
          className="absolute top-0 right-0 h-full flex items-center"
          style={{ width: 120, pointerEvents: "none" }}
        >
          <div
            className="absolute top-0 right-0 h-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(to right, rgba(248,249,252,0) 0%, #F8F9FC 80%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <button
            className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-[#E0E6ED] hover:bg-[#F5F7FA] transition"
            style={{ pointerEvents: "auto", right: 0, position: "absolute" }}
            onClick={handleNext}
            aria-label="Next"
          >
            <Image
              src="/carousel-arrow.png"
              alt="Next"
              width={32}
              height={32}
            />
          </button>
        </div>
      )}
      {/* Left arrow for previous, styled like right arrow */}
      {index > 0 && (
        <div
          className="absolute top-0 left-0 h-full flex items-center"
          style={{ width: 120, pointerEvents: "none" }}
        >
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: "100%",
              background:
                "linear-gradient(to left, rgba(248,249,252,0) 0%, #F8F9FC 80%)",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <button
            className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border border-[#E0E6ED] hover:bg-[#F5F7FA] transition"
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
              width={32}
              height={32}
            />
          </button>
        </div>
      )}
    </div>
  );
}

// .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
// .hide-scrollbar::-webkit-scrollbar { display: none; }
