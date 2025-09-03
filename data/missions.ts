// export const missions = {
//   1: {
//     id: 1,
//     title: "Assemble the robot",
//     intro: {
//       image: "/MissionIntroImage-1.png",
//       description: "Follow simple steps to build your robot piece by piece. Let’s get your robot ready for action!",
//       timeAllocated: "15 mins",
//     },
//     missionPageImage: "/mission1-missionPageImage.png",
//     missionDescription: "Get ready to build your very own robot! In this mission, you’ll connect parts step by step and bring your robot to life. Learn how each component fits together and complete the build to activate your robot.",
//     steps: [
//       {
//         image: "/mission1-step1-image.png",
//         title: "Introduction to Robot Assembly",
//         description: "Welcome to your first mission! In this step, you'll learn the basics of robot assembly...",
//       },
//       {
//         image: "/mission1-step2-image.png",
//         title: "Assemble the Arm",
//         description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
//       },
//       {
//         image: "/mission1-step3-image.png",
//         title: "Assemble the Arm",
//         description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
//       },
//       {
//         image: "/mission1-elevations.png",
//         title: "Robot Elevations",
//         description: "Here are the robot elevations. Review them before finishing the mission.",
//       },
//     ],
//     overlays: [],
//   },
//   2: {
//     id: 2,
//     title: "Connect the robot",
//     intro: {
//       image: "/MissionIntroImage-2.png",
//       description: "Your next mission is to build the robot's arm. Follow the instructions carefully to complete the assembly.",
//       timeAllocated: "30 secs",
//     },
//     missionPageImage: "/mission2-missionPageImage.png",
//     missionDescription: "Time to power up! In this mission, you’ll link your robot to the system and make sure all connections are working. Watch the lights turn on and check if your robot is ready to follow your commands!",
//     steps: [
//       {
//         image: "/mission2-step1-image.png",
//         title: "Attach the Arm",
//         description: "Start by attaching the robot's arm to the main body. Make sure it is secure and moves freely.",
//       },
//       {
//         image: "/mission2-step2-image.png",
//         title: "Test the Arm",
//         description: "Test the arm's movement and ensure all connections are tight. Complete the mission by verifying the arm works as expected.",
//       },
//     ],
//     overlays: [],
//   },
//   3: {
//     id: 3,
//     title: "Wake Up and Move!",
//     intro: {
//       image: "/MissionIntroImage-3.png",
//       description: "Learn to program your robot to move forward when you press the UP arrow key. This is your first step into the world of robot programming!",
//       timeAllocated: "15 mins",
//     },
//     missionPageImage: "/mission3-missionPageImage.png",
//     missionDescription: "In this mission, you'll learn the basics of robot movement programming. You'll use visual blocks to create code that makes your robot respond to keyboard input.",
//     steps: [
//       {
//         image: "/mission3-step1-image.png",
//         title: "Forward March",
//         blocks: [
//           {
//             name: "When (Up) key pressed",           
//           },
//           {
//             name: "Move robot (forward) at 50%",
//           },
          
//         ],
//         tryThis: "Make your robot move forward when you press the UP arrow. ",
//         whyItWorks: "Both wheels spin forward together = straight movement.",
//         mcq: {
//           question: "When you pressed the UP arrow key, what did your robot do?",
//           options: [
//             "It moved forward.",
//             "It moved backward.",
//             "It turned left.",
//             "It did nothing."
//           ],
//           correctAnswer: 0,
//           feedback: {
//             success: "Yay, Awesome!",
//             retry: "Hmm… that doesn't look correct. Try again!"
//           }
//         }
//       },
//       {
//         image: "/mission3-step2-image.png",
//         title: "Reverse Gear",
//         blocks: [
//           {
//             name: "When (Down) key pressed",           
//           },
//           {
//             name: "Move robot (reverse) at 50%",
//           },
          
//         ],
//         tryThis: "Make the robot back up when you press the DOWN arrow.",
//         whyItWorks: "Both wheels spin backward, just like reversing a car.",
//         mcq: {
//           question: "When you pressed the DOWN arrow key, what did your robot do?",
//           options: [
//             "It moved backward.",
//             "It moved forward.", 
//             "It turned right.",
//             "It didn't move at all."
//           ],
//           correctAnswer: 0,
//           feedback: {
//             success: "Your robot is reversing like a boss!",
//             retry: "Ah! That's not quite correct. Try again, you'll get it!"
//           }
//         }
//       },
//       {
//         image: "/mission3-step3-image.png",
//         title: "Left Turn Training",
//         blocks: [
//           {
//             name: " When (Left) key pressed",           
//           },
//           {
//             name: "Turn robot (left) in 50%",
//           },
          
//         ],
//         tryThis: "Turn the robot left when you press the LEFT arrow.",
//         whyItWorks: "One wheel slows down — the other keeps moving = smooth turn.",
//         mcq: {
//           question: "When you pressed the LEFT arrow key, what did your robot do?",
//           options: [
//             "It turned left.",
//             "It turned right.",
//             "It moved straight forward.",
//             "It stopped moving completely."
//           ],
//           correctAnswer: 0,
//           feedback: {
//             success: "Look at that! Your robot just took a cool left!",
//             retry: "Ah! That's not quite correct. Try again, you'll get it!"
//           }
//         }
//       },
//       {
//         image: "/mission3-step4-image.png",
//         title: "Right Spin Mastery",
//         blocks: [
//           {
//             name: "When (Right) key pressed",           
//           },
//           {
//             name: "Turn robot (right) in 50%",
//           },
          
//         ],
//         tryThis: "Make the robot turn right when you press the RIGHT arrow",
//         whyItWorks: "It's just like the left turn — but in the other direction!",
//         mcq: {
//           question: "What is the main difference between a left turn and a right turn?",
//           options: [
//             "The speed of the wheels",
//             "The direction of the turn",
//             "The number of wheels used",
//             "The type of movement block used"
//           ],
//           correctAnswer: 0,
//           feedback: {
//             success: "Whoa! Your robot's doing a right-spin twirl!",
//             retry: "Ah! That's not quite correct. Try again, you'll get it!"
//           }
//         }
//       },
//       {
//         image: "/mission3-step5-image.png",
//         title: "Turbo Time!",
//         blocks: [
//           {
//             name: "Any motion block with speed",           
//           },
          
//         ],
//         tryThis: "Experiment with different speeds. Try 100%, then 20%.",
//         whyItWorks: "Speed control helps you master movement precision.",
//         mcq: {
//           question: "What does changing the speed percentage in a motion block do?",
//           options: [
//             "Changes the robot's color",
//             "Changes how fast the robot moves",
//             "Changes the robot's direction",
//             "Changes the robot's size"
//           ],
//           correctAnswer: 1,
//           feedback: {
//             success: "Fantastic! You've learned that speed control affects movement velocity!",
//             retry: "Think about what happened when you changed the speed from 50% to 100% or 20%."
//           }
//         }
//       },
//     ],
//     overlays: [],
//   },
//   4: {
//     id: 4,
//     title: "Dummy Mission 4",
//     intro: {
//       image: "/MissionIntroImage-4.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "/mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   5: {
//     id: 5,
//     title: "Dummy Mission 5",
//     intro: {
//       image: "/MissionIntroImage-5.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
      
//     },
//     missionPageImage: "/mission5-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   6: {
//     id: 6,
//     title: "Dummy Mission 6",
//     intro: {
//       image: "/MissionIntroImage-6.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "/mission6-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   7: {
//     id: 7,
//     title: "Dummy Mission 7",
//     intro: {
//       image: "/MissionIntroImage-7.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   8: {
//     id: 8,
//     title: "Dummy Mission 8",
//     intro: {
//       image: "/MissionIntroImage-8.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   9: {
//     id: 9,
//     title: "Dummy-Mission 9",
//     intro: {
//       image: "/MissionIntroImage-9.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   10: {
//     id: 10,
//     title: "Dummy-Mission 10",
//     intro: {
//       image: "/MissionIntroImage-10.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   11: {
//     id: 11,
//     title: "Dummy-Mission 11",
//     intro: {
//       image: "/MissionIntroImage-11.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
//   12: {
//     id: 12,
//     title: "Dummy-Mission 12",
//     intro: {
//       image: "/MissionIntroImage-12.png",
//       description: "This is a placeholder for a future mission.",
//       timeAllocated: "-- mins",
//     },
//     missionPageImage: "mission4-missionPageImage.png",
//     missionDescription: "Coming soon!",
//     steps: [],
//     overlays: [],
//   },
// }; 
