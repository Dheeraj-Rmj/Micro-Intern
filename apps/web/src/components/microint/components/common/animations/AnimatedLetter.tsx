"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import React from "react";

interface AnimatedLetterProps {
  text: string;
  className?: string;
}

interface CharSpanProps {
  char: string;
  i: number;
  totalChars: number;
  scrollYProgress: any;
}

const CharSpan: React.FC<CharSpanProps> = ({ char, i, totalChars, scrollYProgress }) => {
  const charProgress = i / totalChars;
  const opacity = useTransform(
    scrollYProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1],
  );

  return <motion.span style={{ opacity }}>{char === " " ? "\u00A0" : char}</motion.span>;
};

export const AnimatedLetter: React.FC<AnimatedLetterProps> = ({ text, className = "" }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "end 0.2"],
  });

  const characters = text.split("");
  const totalChars = characters.length;

  return (
    <p ref={container} className={`flex flex-wrap ${className}`}>
      {characters.map((char, i) => (
        <CharSpan
          key={i}
          char={char}
          i={i}
          totalChars={totalChars}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </p>
  );
};
