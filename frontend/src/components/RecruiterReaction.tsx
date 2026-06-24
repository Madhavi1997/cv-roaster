import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const reactions = [
  "👀 Recruiter opened CV...",
  "🤔 Recruiter is squinting at your font choice...",
  "😬 Recruiter sighed deeply...",
  "☕ Recruiter took a coffee break to recover...",
  "🤦‍♂️ Recruiter is questioning life choices...",
  "✅ Recruiter finished reading (barely)...",
  "🔥 Firing up the roaster..."
];

export const RecruiterReaction = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, reactions.length - 1));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-6 h-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-500 italic drop-shadow-lg"
        >
          {reactions[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
