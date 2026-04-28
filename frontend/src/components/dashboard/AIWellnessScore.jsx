import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedGauge from '../ui/AnimatedGauge';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import WellnessOrb from '../ui/WellnessOrb';
import wellnessScorer from '../../utils/wellness/wellnessScoring';
import '../../styles/glassmorphism.css';

/**
 * AIWellnessScore - Main scoring dashboard with 6-dimensional wellness display
 */
const AIWellnessScore = ({ metrics = {} }) => {
  const [scores, setScores] = useState({
    postureScore: 0,
    eyeHealthScore: 0,
    focusScore: 0,
    fatigueScore: 0,
    productivityScore: 0,
    wellnessIndex: 0,
  });

  useEffect(() => {
    if (metrics && Object.keys(metrics).length > 0) {
      const updatedScores = wellnessScorer.updateScores(metrics);
      setScores(updatedScores);
    }
  }, [metrics]);

  const gaugeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Wellness Index */}
      <div className="mb-8">
        <GlassmorphicCard className="flex flex-col items-center py-8" glow>
          <motion.h2
            className="text-2xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Your Wellness Profile
          </motion.h2>
          <WellnessOrb 
            wellnessIndex={scores.wellnessIndex} 
            size={250}
            showDetails
          />
        </GlassmorphicCard>
      </div>

      {/* 6-Dimensional Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Posture Score */}
        <motion.div
          custom={0}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={scores.postureScore}
                title="Posture"
                icon={null}
                color="#00D9FF"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.postureScore >= 80
                ? 'Excellent alignment'
                : scores.postureScore >= 60
                ? 'Minor adjustments recommended'
                : 'Needs improvement'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>

        {/* Eye Health Score */}
        <motion.div
          custom={1}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={scores.eyeHealthScore}
                title="Eye Health"
                icon={null}
                color="#EC4899"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.eyeHealthScore >= 80
                ? 'Blink rate looks good'
                : scores.eyeHealthScore >= 60
                ? 'Consider a brief eye break'
                : 'Take an eye break now'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>

        {/* Focus Score */}
        <motion.div
          custom={2}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={scores.focusScore}
                title="Focus"
                icon={null}
                color="#10B981"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.focusScore >= 80
                ? 'Excellent focus'
                : scores.focusScore >= 60
                ? 'Good concentration'
                : 'Refocus recommended'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>

        {/* Fatigue Score */}
        <motion.div
          custom={3}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={100 - scores.fatigueScore}
                title="Energy"
                icon={null}
                color="#F59E0B"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.fatigueScore <= 30
                ? 'Energy looks good'
                : scores.fatigueScore <= 60
                ? 'Some fatigue detected'
                : 'Take a break soon'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>

        {/* Productivity Score */}
        <motion.div
          custom={4}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={scores.productivityScore}
                title="Productivity"
                icon={null}
                color="#8B5CF6"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.productivityScore >= 80
                ? 'High performance'
                : scores.productivityScore >= 60
                ? 'Steady pace'
                : 'Consider adjusting habits'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>

        {/* Wellness Index Summary */}
        <motion.div
          custom={5}
          variants={gaugeVariants}
          initial="hidden"
          animate="visible"
        >
          <GlassmorphicCard interactive glow>
            <div className="flex justify-center mb-4">
              <AnimatedGauge
                value={scores.wellnessIndex}
                title="Overall"
                icon={null}
                color="#6366F1"
                size={120}
              />
            </div>
            <motion.p className="text-xs text-slate-400 text-center mt-2">
              {scores.wellnessIndex >= 80
                ? 'Strong overall wellness'
                : scores.wellnessIndex >= 60
                ? 'Overall wellness is fair'
                : 'Overall wellness needs improvement'}
            </motion.p>
          </GlassmorphicCard>
        </motion.div>
      </div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['posture', 'eyeHealth', 'focus', 'productivity'].map((metric, i) => {
          const trend = wellnessScorer.getTrend(metric);
          return (
            <motion.div
              key={metric}
              custom={i}
              variants={gaugeVariants}
              initial="hidden"
              animate="visible"
              className="glassmorphic-dark rounded-lg p-3 text-center"
            >
              <div className="text-xs text-slate-400 capitalize mb-1">
                {metric === 'eyeHealth' ? 'Eye' : metric}
              </div>
              <div className="text-sm font-semibold">
                {trend.trend === 'improving' && 'Improving'}
                {trend.trend === 'declining' && 'Declining'}
                {trend.trend === 'stable' && 'Stable'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {trend.percentage.toFixed(1)}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIWellnessScore;
