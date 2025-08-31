"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I get started with Neo?",
    answer: "Getting started is easy! Simply sign up for an account, complete your profile, and you'll have access to our interactive coding missions and playground."
  },
  {
    question: "What programming languages are supported?",
    answer: "Neo currently supports Python, JavaScript, and Blockly visual programming. We're constantly adding support for more languages."
  },
  {
    question: "How do I connect my device?",
    answer: "You can connect your device via USB or Bluetooth. Make sure you have the latest firmware installed and follow the connection guide in the playground."
  },
  {
    question: "Can I use Neo offline?",
    answer: "Some features are available offline, but for the best experience and to sync your progress, we recommend using Neo with an internet connection."
  },
  {
    question: "How do I reset my password?",
    answer: "You can reset your password from the sign-in page by clicking 'Forgot Password' and following the email instructions."
  },
  {
    question: "What devices are compatible?",
    answer: "Neo is compatible with most modern browsers and supports both desktop and mobile devices. For hardware connections, check our compatibility list."
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/side-logo.png" 
                  alt="Neo Logo" 
                  width={200} 
                  height={100}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-[#222E3A]">Neo</span>
              </Link>
            </div>
            <button
              onClick={() => window.location.href = '/home'}
              className="px-4 py-2 text-sm font-medium text-[#222E3A] hover:text-[#4A5568] transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[#4A5568] max-w-2xl mx-auto">
            Find answers to common questions about Neo. Can't find what you're looking for? 
            <Link href="/contact" className="text-[#4A90E2] hover:text-[#357ABD] font-medium ml-1">
              Contact us
            </Link>
            .
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-semibold text-[#222E3A]">
                  {item.question}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-200 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="#222E3A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="h-px bg-gray-100 mb-4" />
                  <p className="text-[#4A5568] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-[#F0F4F8] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#4A90E2]"
            >
              <path
                d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#222E3A] mb-2">
            Still need help?
          </h3>
          <p className="text-[#4A5568] mb-6">
            Our support team is here to help you get the most out of Neo.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#4A90E2] text-white font-medium rounded-lg hover:bg-[#357ABD] transition-colors"
            >
              Contact Support
            </Link>
                         <button
               onClick={() => window.location.href = '/home'}
               className="px-6 py-3 border border-gray-300 text-[#222E3A] font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
             >
               Back to Home
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
