"use client";

interface StepSuccessCardProps {
  onNext: () => void;
  message?: string;
  buttonText?: string;
  buttonColor?: string;
  imageSrc?: string;
}

export default function StepSuccessCard({
  onNext,
  message = "Yay, Awesome!",
  buttonText = "Next",
  buttonColor = "black",
  imageSrc,
}: StepSuccessCardProps) {
  // Randomly select from available happy robot images
  const getRandomHappyRobotImage = () => {
    const happyRobotImages = [
      "/happy-robot-correct-1.png",
      "/happy-robot-correct-2.png",
      "/happy-robot-correct-3.png",
    ];
    const randomIndex = Math.floor(Math.random() * happyRobotImages.length);
    return happyRobotImages[randomIndex];
  };

  // Use provided imageSrc or randomly select one
  const selectedImage = imageSrc || getRandomHappyRobotImage();
  const getButtonClasses = () => {
    if (buttonColor === "blue") {
      return "px-12 py-3 rounded-3xl bg-[#00AEEF] text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition hover:bg-[#0098D4]";
    }
    return "px-12 py-3 rounded-3xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition hover:bg-gray-800";
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col sm:flex-row items-center min-w-[300px] sm:min-w-[400px] max-w-[90vw] sm:max-w-[50vw]">
      {/* Left Side - Happy Robot */}
      <div className="mr-0 sm:mr-8 mb-4 sm:mb-0">
        <img
          src={selectedImage}
          alt="Happy Robot"
          className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] object-contain"
        />
      </div>

      {/* Right Side - Message and Button */}
      <div className="flex flex-col flex-1">
        <div className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-[#222E3A] text-center sm:text-left">
          {message}
        </div>
        <div className="flex justify-start">
          <button onClick={onNext} className={getButtonClasses()}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
