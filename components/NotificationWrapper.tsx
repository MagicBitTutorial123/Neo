"use client";
import { useState, useEffect } from "react";
import Notification from "./Notification";
import { motion, AnimatePresence } from "framer-motion";

// Random names for notifications
const randomNames = [
  "Alex", "Sam", "Jordan", "Taylor", "Casey", "Riley", "Quinn", "Avery",
  "Morgan", "Parker", "Drew", "Blake", "Cameron", "Dakota", "Emery", "Finley",
  "Harper", "Indigo", "Jamie", "Kendall", "Logan", "Mason", "Noah", "Oakley",
  "Peyton", "River", "Sage", "Tatum", "Vega", "Winter", "Xander", "Zion",
  "Kai", "Luna", "Nova", "Phoenix", "Raven", "Sky", "Storm", "Thunder",
  "Echo", "Flame", "Glow", "Haze", "Iris", "Jade", "Kite", "Lark",
  "Mist", "Nyx", "Orion", "Pulse", "Quill", "Rift", "Sparrow", "Tide"
];

// Random avatar images
const randomAvatars = [
  "/aww-robot-new.png",
  
  "/happy-robot-correct-1.png",
  "/happy-robot-correct-2.png",
  "/happy-robot-correct-3.png",
  "/happy-bot.png",
  "/crying-bot.png",
  "/confettiBot.png",
  "/aww-robot.png",
  
];

// Random notification messages
const randomMessages = [
  "just earned the coolest badge!",
  "completed a new achievement!",
  "unlocked a new feature!",
  "received a special reward!",
  "completed a difficult challenge!",
  "unlocked a hidden achievement!",
  "received a surprise gift!",
  "completed a special mission!",
  "unlocked a secret level!",
  "received a unique item!",
  "became a coding master!",
  "solved the impossible puzzle!",
  "unlocked legendary status!",
  "earned the innovation badge!",
  "completed the ultimate challenge!",
  "unlocked the master coder title!",
  "achieved expert level!",
  "unlocked the secret achievement!",
  "became a problem solver!",
  "earned the genius title!"
];

export default function NotificationWrapper() {
  const [showNotification, setShowNotification] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  // Function to get random item from array
  const getRandomItem = (array: string[]) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Function to show notification with random name and avatar
  const showRandomNotification = () => {
    setCurrentName(getRandomItem(randomNames));
    setCurrentAvatar(getRandomItem(randomAvatars));
    setCurrentMessage(getRandomItem(randomMessages));
    setShowNotification(true);
  };

  useEffect(() => {
    // Show initial notification after 1 second
    const initialTimer = setTimeout(() => {
      showRandomNotification();
    }, 1000);

    // Set up interval to show new notifications with random timing (15-45 seconds)
    const showNextNotification = () => {
      const randomDelay = Math.random() * 30000 + 15000; // Random delay between 15-45 seconds
      setTimeout(() => {
        if (!showNotification) {
          showRandomNotification();
          showNextNotification(); // Schedule next notification
        }
      }, randomDelay);
    };

    // Start the chain of notifications
    showNextNotification();

    return () => {
      clearTimeout(initialTimer);
    };
  }, [showNotification]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        >
          <Notification
            avatar={currentAvatar}
            name={currentName}
            message={currentMessage}
            onClose={() => setShowNotification(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
