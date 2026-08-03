'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import React from 'react';

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export const WordsPullUp: React.FC<WordsPullUpProps> = ({ text, className = '', showAsterisk = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const isLastWord = i === words.length - 1;
        return (
          <motion.div
            key={i}
            className="overflow-hidden mr-[0.2em] pr-[0.08em] pb-[0.08em]"
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="inline-block relative">
              {word}
              {showAsterisk && isLastWord && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
