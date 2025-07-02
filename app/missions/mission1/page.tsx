"use client";
import SideNavbar from "@/components/SideNavbar";
import MissionIntro from "@/components/MissionIntro";

export default function Mission1Page() {
  return (
    <div className="flex min-h-screen bg-white">
      <SideNavbar />
      <MissionIntro
        missionNumber={1}
        title="Assemble the robot"
        timeAllocated="15 mins"
        image="/MissionIntroImage-1.png"
        instructions={
          "Some instructions for the mission.\nLorem ipsum dolor sit amet consectetur. Sit morbi lectus odio amet. Morbi arcu quis tortor lectus pharetra massa ut tellus. Aliquam a ultricies tristique massa mus nisi ac leo. Sed rutrum pulvinar risus dapibus tristique nulla elit adipiscing."
        }
      />
    </div>
  );
}
