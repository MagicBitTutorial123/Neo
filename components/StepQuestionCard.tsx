import React from "react";

interface StepQuestionCardProps {
  question: string;
  onYes: () => void;
  onNo: () => void;
  yesLabel?: string;
  noLabel?: string;
}

export default function StepQuestionCard({
  question,
  onYes,
  onNo,
  yesLabel = "Yes",
  noLabel = "No",
}: StepQuestionCardProps) {
  return (
      <div className="bg-white rounded-2xl shadow-lg px-12 py-10 flex flex-col items-center min-w-[350px] max-w-[90vw]">
        <div className="mb-8 text-center text-base font-medium text-[#222E3A]">
          {question}
        </div>
        <div className="flex gap-6">
          <button
            onClick={onNo}
            className="px-8 py-2 rounded-xl bg-[#D9F2FF] text-[#222E3A] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition"
          >
            {noLabel}
          </button>
          <button
            onClick={onYes}
            className="px-8 py-2 rounded-xl bg-black text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            {yesLabel}
          </button>
      </div>
    </div>
  );
}
