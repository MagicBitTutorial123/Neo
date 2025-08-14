"use client";

import { useState } from "react";

interface MCQCardProps {
  question: string;
  options: string[];
  correctAnswer: number; // 0-3 index of correct answer
  onAnswer: (selectedAnswer: number) => void;
  questionNumber?: number; // For displaying Q1, Q2, etc.
}

export default function MCQCard({
  question,
  options,
  correctAnswer,
  onAnswer,
  questionNumber = 1,
}: MCQCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleOptionSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleReview = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg px-8 py-8 flex flex-col min-w-[400px] max-w-[90vw]">
      {/* Question Section */}
      <div className="flex items-start mb-6">
        <span className="text-[#00AEEF] font-extrabold text-2xl mr-4">
          Q{questionNumber}
        </span>
        <div className="text-base font-medium text-black flex-1">
          {question}
        </div>
      </div>

      {/* Options Section */}
      <div className="flex flex-col gap-4 mb-8">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center cursor-pointer"
            onClick={() => handleOptionSelect(index)}
          >
            <div className="mr-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedAnswer === index
                    ? "border-[#4A90E2] bg-[#4A90E2]"
                    : "border-gray-300"
                }`}
              >
                {selectedAnswer === index && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span className="text-base text-[#808080]">{option}</span>
          </div>
        ))}
      </div>

      {/* Review Button */}
      <div className="flex justify-end">
        <button
          onClick={handleReview}
          disabled={selectedAnswer === null}
          className={`px-6 py-3 rounded-3xl font-bold text-base transition-colors ${
            selectedAnswer !== null
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Review
        </button>
      </div>
    </div>
  );
}
