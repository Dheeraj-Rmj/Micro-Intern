'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import React from 'react';

export interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  className?: string;
}

export const WordsPullUpMultiStyle: React.FC<WordsPullUpMultiStyleProps> = ({ segments, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Flatten words while keeping track of their style
  const flattenedWords: { word: string; styleClass: string; globalIndex: number }[] = [];
  let globalWordIndex = 0;

  segments.forEach((segment) => {
    const words = segment.text.split(' ');
    words.forEach((word) => {
      if (word.trim() !== '') {
        flattenedWords.push({
          word,
          styleClass: segment.className || '',
          globalIndex: globalWordIndex++,
        });
      }
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {flattenedWords.map((item, i) => (
        <motion.div
          key={i}
          className="overflow-hidden mr-[0.2em]"
          initial={{ y: '100%', opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{
            duration: 0.8,
            delay: item.globalIndex * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className={`inline-block ${item.styleClass}`}>
            {item.word}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
