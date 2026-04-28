import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import burnoutPredictor from '../../utils/wellness/burnoutPredictor';
import { BURNOUT_RISK_LEVELS } from '../../constants/wellnessThresholds';
import '../../styles/glassmorphism.css';

/**
 * BurnoutPredictor - Predictive burnout detection display
 */
const BurnoutPredictorComponent = ({ metrics = {}, historicalData = {} }) => {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState(BURNOUT_RISK_LEVELS.LOW);
  const [timeline, setTimeline] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [riskFactors, setRiskFactors] = useState({});

  useEffect(() => {
    if (metrics && Object.keys(metrics).length > 0) {
      const score = burnoutPredictor.predictBurnoutRisk(metrics, historicalData);
      const level = burnoutPredictor.getRiskLevel(score);
      const mins = burnoutPredictor.predictBurnoutTimeline(score, 0.5);
      const factors = burnoutPredictor.riskFactors;
      const recs = burnoutPredictor.getRecommendations(score, factors);

      setRiskScore(score);
      setRiskLevel(level);
      setTimeline(mins);
      setRiskFactors(factors);
      setRecommendations(recs);
    }
  }, [metrics, historicalData]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Risk Indicator */}
      <motion.div variants={itemVariants}>
        <GlassmorphicCard
          className="mb-6"
          glow={riskScore > 60}
          style={{
            borderColor:
              riskScore > 80
                ? 'rgba(220, 38, 38, 0.3)'
                : riskScore > 60
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Burnout Risk Assessment</h3>
              <p className="text-sm text-slate-400">
                {riskScore > 80
                  ? 'Critical burnout risk detected'
                  : riskScore > 60
                  ? 'High risk of burnout'
                  : riskScore > 40
                  ? 'Moderate risk detected'
                  : 'Low risk'}
              </p>
            </div>

            {/* Risk Score Circle */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ scale: riskScore > 60 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: riskScore > 60 ? Infinity : 0 }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl"
                style={{
                  background:
                    riskScore > 80
                      ? 'rgba(220, 38, 38, 0.1)'
                      : riskScore > 60
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                  border: `2px solid ${riskLevel.color}`,
                  boxShadow: `0 0 15px ${riskLevel.color}40`,
                }}
              >
                {Math.round(riskScore)}%
              </div>
              <div className="text-xs text-slate-400 mt-2">{riskLevel.label}</div>
            </motion.div>
          </div>

          {/* Risk Timeline */}
          {timeline && riskScore > 50 && (
            <motion.div
              className="mt-4 p-3 bg-slate-900 bg-opacity-40 rounded-lg border border-slate-700 border-opacity-30"
              variants={itemVariants}
            >
              <p className="text-sm text-orange-300">
                Burnout risk may increase in approximately {timeline} minutes
              </p>
            </motion.div>
          )}
        </GlassmorphicCard>
      </motion.div>

      {/* Risk Factors Breakdown */}
      <motion.div variants={itemVariants} className="mb-6">
        <GlassmorphicCard>
          <h4 className="font-semibold mb-4">Risk Factor Analysis</h4>
          <div className="space-y-3">
            {Object.entries(riskFactors).map(([factor, value]) => (
              <motion.div
                key={factor}
                className="flex items-center gap-3"
                whileHover={{ x: 4 }}
              >
                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-1 capitalize">
                    {factor.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="w-full bg-slate-900 bg-opacity-50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          value > 70
                            ? '#DC2626'
                            : value > 50
                            ? '#EF4444'
                            : value > 30
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <div className="text-xs font-semibold w-8 text-right">{Math.round(value)}%</div>
              </motion.div>
            ))}
          </div>
        </GlassmorphicCard>
      </motion.div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard>
            <h4 className="font-semibold mb-4">Recommended actions</h4>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className="p-3 rounded-lg border-l-4"
                  style={{
                    borderColor:
                      rec.priority === 'critical'
                        ? '#DC2626'
                        : rec.priority === 'high'
                        ? '#EF4444'
                        : '#F59E0B',
                    background:
                      rec.priority === 'critical'
                        ? 'rgba(220, 38, 38, 0.1)'
                        : rec.priority === 'high'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="font-semibold text-sm">{rec.action.toUpperCase()}</div>
                  <p className="text-xs text-slate-300 mt-1">{rec.reason}</p>
                  <div className="text-xs text-slate-400 mt-2">
                    Duration: {rec.duration} minute{rec.duration > 1 ? 's' : ''}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BurnoutPredictorComponent;
