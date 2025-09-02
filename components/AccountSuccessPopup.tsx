"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AccountSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function AccountSuccessPopup({ isOpen, onClose, userName }: AccountSuccessPopupProps) {
  const router = useRouter();

  const handleContinue = () => {
    onClose();
    // Redirect to new user onboarding/home page
    router.push("/home?newUser=true&onboarding=true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#AAA7AD] bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
                Welcome to BuddyNeo!
              </h2>
              <p className="text-gray-600 text-lg">
                You&apos;ve successfully created your account, <span className="font-semibold text-[#00AEEF]">{userName}</span>!
              </p>
            </div>

            {/* Robot Image */}
            <div className="flex justify-center mb-6">
              <Image
                src="/confettiBot.png"
                alt="Celebrating Robot"
                width={120}
                height={120}
                className="animate-bounce"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-[#00AEEF] hover:bg-[#0A6CFF] text-white font-bold py-4 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl"
            >
              Start Onboarding!
            </button>

            {/* Additional Info */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Your account is now ready. Let&apos;s start your onboarding journey!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
