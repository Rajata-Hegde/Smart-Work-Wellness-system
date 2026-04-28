import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/animations.css';
import '../../styles/glassmorphism.css';

/**
 * WellnessOrb - Animated wellness indicator
 * Central visual element that shows overall wellness status
 */
const WellnessOrb = ({ wellnessIndex = 0, size = 200, showDetails = false }) => {
  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - 20);
  const strokeDashoffset = circumference * (1 - wellnessIndex / 100);

  // Color based on wellness index
  const getColor = () => {
    if (wellnessIndex >= 80) return '#10B981'; // Green
    if (wellnessIndex >= 60) return '#F59E0B'; // Amber
    if (wellnessIndex >= 40) return '#EF4444'; // Red
    return '#DC2626'; // Dark red
  };

  const getGlowColor = () => {
    if (wellnessIndex >= 80) return 'rgba(16, 185, 129, 0.6)';
    if (wellnessIndex >= 60) return 'rgba(245, 158, 11, 0.6)';
    if (wellnessIndex >= 40) return 'rgba(239, 68, 68, 0.6)';
    return 'rgba(220, 38, 38, 0.6)';
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center relative"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size + 40,
          height: size + 40,
          background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* SVG Circle Progress */}
      <svg width={size} height={size} className="relative">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 20}
          fill="none"
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth="8"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 20}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()})`,
          }}
        />
      </svg>

      {/* Center content */}
      <motion.div
        className="absolute flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-4xl font-bold">{Math.round(wellnessIndex)}</div>
        <div className="text-xs text-slate-400 mt-1">Wellness Index</div>

        {showDetails && (
          <motion.div
            className="text-xs text-slate-300 mt-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {wellnessIndex >= 80 ? '✨ Excellent' : 
             wellnessIndex >= 60 ? '⚠️ Good' : 
             wellnessIndex >= 40 ? '⚠️ Fair' : '❌ Poor'}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WellnessOrb;
