import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedGauge - Beautiful animated gauge for metrics
 */
const AnimatedGauge = ({
  value = 0,
  max = 100,
  title = 'Score',
  icon = null,
  color = '#6366F1',
  size = 100,
  showLabel = true,
  animated = true,
}) => {
  const percentage = (value / max) * 100;
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  // Get status based on value
  const getStatus = () => {
    if (percentage >= 80) return { text: 'Excellent', color: '#10B981' };
    if (percentage >= 60) return { text: 'Good', color: '#F59E0B' };
    if (percentage >= 40) return { text: 'Fair', color: '#EF4444' };
    return { text: 'Poor', color: '#DC2626' };
  };

  const status = getStatus();

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title */}
      {title && (
        <div className="text-sm font-semibold text-slate-300">{title}</div>
      )}

      {/* Gauge Container */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* SVG Gauge */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="6"
          />

          {/* Progress track */}
          {animated ? (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
          ) : (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 6px ${color})`,
              }}
            />
          )}
        </svg>

        {/* Center value */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold">{Math.round(value)}</div>
          {showLabel && <div className="text-xs text-slate-400">{status.text}</div>}
        </motion.div>
      </div>

      {/* Icon */}
      {icon ? <div className="text-2xl">{icon}</div> : null}
    </motion.div>
  );
};

export default AnimatedGauge;
