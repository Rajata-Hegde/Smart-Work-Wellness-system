import React from 'react';
import { motion } from 'framer-motion';

/**
 * BreathingOrb - Animated breathing orb for meditation/focus
 */
const BreathingOrb = ({ isActive = false, color = '#6366F1', size = 150 }) => {
  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer breathing ring */}
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`,
        }}
        animate={
          isActive
            ? {
                scale: [0.8, 1.1, 0.8],
                opacity: [0.3, 1, 0.3],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          border: `1px solid ${color}`,
          opacity: 0.4,
        }}
        animate={
          isActive
            ? {
                scale: [0.9, 1, 0.9],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />

      {/* Inner circle */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        }}
        animate={
          isActive
            ? {
                scale: [0.95, 1.05, 0.95],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {isActive && (
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-100">Breathe</div>
            <div className="text-xs text-slate-400">In... Out...</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BreathingOrb;
