"use client";
import { useState, useEffect } from "react";
import Notification from "./Notification";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationWrapper() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
            avatar="/aww-robot-new.png"
            name="Samith"
            message="just earned the coolest badge!"
            onClose={() => setShowNotification(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
