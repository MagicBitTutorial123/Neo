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
  imageSrc = "/happy-robot-correct.png",
}: StepSuccessCardProps) {
  const getButtonClasses = () => {
    if (buttonColor === "blue") {
      return "px-12 py-3 rounded-3xl bg-[#00AEEF] text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition hover:bg-[#0098D4]";
    }
    return "px-12 py-3 rounded-3xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition hover:bg-gray-800";
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg px-8 py-8 flex items-center min-w-[400px] max-w-[50vw]">
      {/* Left Side - Happy Robot */}
      <div className="mr-8">
        <img
          src={imageSrc}
          alt="Happy Robot"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Right Side - Message and Button */}
      <div className="flex flex-col flex-1">
        <div className="mb-6 text-2xl font-bold text-[#222E3A]">{message}</div>
        <div className="flex justify-start">
          <button onClick={onNext} className={getButtonClasses()}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
