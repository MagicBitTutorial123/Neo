"use client";

import Lottie from "lottie-react";
import animationData from "../assets/animation.json";

export default function CongratsAnimation({
  width = 220,
  height = 220,
  loop = true,
  autoplay = true,
}: {
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
}) {
  return (
    <div style={{ width, height }}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
