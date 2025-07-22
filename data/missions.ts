export const missions = {
  1: {
    id: 1,
    title: "Assemble the robot",
    intro: {
      image: "/MissionIntroImage-1.png",
      description: "Some instructions for the mission. Lorem ipsum dolor sit amet consectetur...",
      timeAllocated: "15 mins",
    },
    missionPageImage: "/mission1-missionPageImage.png",
    missionDescription: "Neque sit sed amet adipiscing urna faucibus nulla porttitor.Lorem ipsum dolor sit amet consectetur. Orci nulla non odio amet posuere. Lectus tortor et natoque cursus id. Lacus penatibus proin rhoncus pellentesque a scelerisque. Neque sit sed amet adipiscing urna faucibus nulla porttitor.",
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
    missionPageImage: "/mission2-missionPageImage.png",
    missionDescription: "cing urna faucibus nulla porttitor.Lorem ipsum dolor sit amet consectetur. Orci nulla non odio amet posuere. Lectus tortor et natoque cursus id. Lacus penatibus proin rhoncus pellentesque a scelerisque. Neque sit sed amet adipiscing urna faucibus nulla porttitor.",
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
  3: {
    id: 3,
    title: "Wake Up and Move!",
    intro: {
      image: "/MissionIntroImage-3.png",
      description: "Learn to program your robot to move forward when you press the UP arrow key. This is your first step into the world of robot programming!",
      timeAllocated: "15 mins",
    },
    missionPageImage: "/mission3-missionPageImage.png",
    missionDescription: "In this mission, you'll learn the basics of robot movement programming. You'll use visual blocks to create code that makes your robot respond to keyboard input.",
    steps: [
      {
        image: "/mission3-step1-image.png",
        title: "Forward March (2 XP)",
        blocks: [
          {
            name: "When (Up) key pressed",           
          },
          {
            name: "Move robot (forward) at 50%",
          },
          
        ],
        tryThis: "Make your robot move forward when you press the UP arrow. ",
        whyItWorks: "Both wheels spin forward together = straight movement.",
      },
      {
        image: "/mission3-step2-image.png",
        title: "Reverse Gear (2 XP)",
        blocks: [
          {
            name: "When (Down) key pressed",           
          },
          {
            name: "Move robot (reverse) at 50%",
          },
          
        ],
        tryThis: "Make the robot back up when you press the DOWN arrow.",
        whyItWorks: "Both wheels spin backward, just like reversing a car.",      },
    ],
    overlays: [],
  },
  4: {
    id: 4,
    title: "Dummy Mission 4",
    intro: {
      image: "/MissionIntroImage-4.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "/mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  5: {
    id: 5,
    title: "Dummy Mission 5",
    intro: {
      image: "/MissionIntroImage-5.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
      
    },
    missionPageImage: "/mission5-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  6: {
    id: 6,
    title: "Dummy Mission 6",
    intro: {
      image: "/MissionIntroImage-6.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "/mission6-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  7: {
    id: 7,
    title: "Dummy Mission 7",
    intro: {
      image: "/MissionIntroImage-7.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  8: {
    id: 8,
    title: "Dummy Mission 8",
    intro: {
      image: "/MissionIntroImage-8.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  9: {
    id: 9,
    title: "Dummy-Mission 9",
    intro: {
      image: "/MissionIntroImage-9.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  10: {
    id: 10,
    title: "Dummy-Mission 10",
    intro: {
      image: "/MissionIntroImage-10.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  11: {
    id: 11,
    title: "Dummy-Mission 11",
    intro: {
      image: "/MissionIntroImage-11.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
  12: {
    id: 12,
    title: "Dummy-Mission 12",
    intro: {
      image: "/MissionIntroImage-12.png",
      description: "This is a placeholder for a future mission.",
      timeAllocated: "-- mins",
    },
    missionPageImage: "mission4-missionPageImage.png",
    missionDescription: "Coming soon!",
    steps: [],
    overlays: [],
  },
}; 
