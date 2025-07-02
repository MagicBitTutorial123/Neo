export const missions = {
  1: {
    id: 1,
    title: "Assemble the robot",
    intro: {
      image: "/MissionIntroImage-1.png",
      description: "Some instructions for the mission. Lorem ipsum dolor sit amet consectetur...",
      timeAllocated: "15 mins",
    },
    steps: [
      {
        image: "/mission1-step1-image.png",
        title: "Introduction to Robot Assembly",
        description: "Welcome to your first mission! In this step, you'll learn the basics of robot assembly...",
      },
      {
        image: "/mission1-step2-image.png",
        title: "Assemble the Arm",
        description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
      },
      {
        image: "/mission1-step2-image.png",
        title: "Assemble the Arm",
        description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
      },
      {
        image: "/mission1-elevations.png",
        title: "Robot Elevations",
        description: "Here are the robot elevations. Review them before finishing the mission.",
      },
    ],
    overlays: [],
  },
  2: {
    id: 2,
    title: "Connect the robot",
    intro: {
      image: "/MissionIntroImage-2.png",
      description: "Your next mission is to build the robot's arm. Follow the instructions carefully to complete the assembly.",
      timeAllocated: "10 mins",
    },
    steps: [
      {
        image: "/mission1-step2-image.png",
        title: "Attach the Arm",
        description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
      },
      {
        image: "/mission1-step1-image.png",
        title: "Test the Arm",
        description: "Test the arm's movement and ensure all connections are tight. Complete the mission by verifying the arm works as expected.",
      },
    ],
    overlays: [],
  },
}; 