'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedLogoTitleProps {
  className?: string;
}

export default function AnimatedLogoTitle({ className = '' }: AnimatedLogoTitleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    hidden: { y: '100%', opacity: 0 },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  const wordStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    color: 'white',
  };

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-baseline gap-[0.25em] ${className}`}
    >
      {/* Micro */}
      <div style={{ overflow: 'hidden', paddingBottom: '0.15em', marginBottom: '-0.15em' }}>
        <motion.span
          style={wordStyle}
          className="inline-block"
          variants={variants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
        >
          Micro
        </motion.span>
      </div>

      {/* Intern */}
      <div style={{ overflow: 'hidden', paddingBottom: '0.15em', marginBottom: '-0.15em' }}>
        <motion.span
          style={{
            fontFamily: "'Playfair Display', serif",
            background: 'linear-gradient(180deg, #FFE36A 0%, #F7C948 35%, #E9AE16 65%, #D18B00 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
          }}
          variants={variants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.09}
        >
          Intern
        </motion.span>
      </div>
    </div>
  );
}

// Named export so existing imports still work
export { AnimatedLogoTitle };
