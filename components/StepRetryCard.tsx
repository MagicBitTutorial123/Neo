"use client";

interface StepRetryCardProps {
  onTryAgain: () => void;
  message?: string;
  imageSrc?: string;
}

export default function StepRetryCard({
  onTryAgain,
  message = "Hmm... that doesn't look correct. Try again!",
  imageSrc,
}: StepRetryCardProps) {
  // Randomly select from available sad robot images
  const getRandomSadRobotImage = () => {
    const sadRobotImages = [
      "/sad-robot-wrong-answer-1.png",
      "/sad-robot-wrong-answer-2.png",
    ];
    const randomIndex = Math.floor(Math.random() * sadRobotImages.length);
    return sadRobotImages[randomIndex];
  };

  // Use provided imageSrc or randomly select one
  const selectedImage = imageSrc || getRandomSadRobotImage();
  return (
    <div className="relative bg-white rounded-2xl shadow-lg px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col sm:flex-row items-center min-w-[300px] sm:min-w-[400px] max-w-[90vw] sm:max-w-[50vw]">
      {/* Left Side - Sad Robot */}
      <div className="mr-0 sm:mr-8 mb-4 sm:mb-0">
        <img
          src={selectedImage}
          alt="Sad Robot"
          className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-contain"
        />
      </div>

      {/* Right Side - Message and Button */}
      <div className="flex flex-col flex-1">
        <div className="mb-4 sm:mb-6 text-lg sm:text-xl font-medium text-[#222E3A] leading-relaxed text-center sm:text-left">
          {message}
        </div>
        <div className="flex justify-start">
          <button
            onClick={onTryAgain}
            className="px-6 py-3 rounded-3xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
