import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { ACHIEVEMENTS, XP_LEVELS, XP_REWARDS } from '../../constants/gameConfig';
import '../../styles/glassmorphism.css';

/**
 * GameificationDashboard - XP, levels, achievements, and challenges
 */
const GameificationDashboard = ({ completedExercises = [], sessionStats = {} }) => {
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [dailyChallengProgress, setDailyChallengeProgress] = useState(0);

  useEffect(() => {
    // Calculate XP from completed exercises and metrics
    let xp = 0;
    
    // XP from exercises
    xp += completedExercises.length * XP_REWARDS.EXERCISE_COMPLETED;

    // XP from session
    if (sessionStats.duration) {
      xp += XP_REWARDS.SESSION_COMPLETED;
    }

    // XP from good metrics
    if (sessionStats.postureScore > 80) {
      xp += XP_REWARDS.GOOD_POSTURE * 10;
    }

    setTotalXP(xp);

    // Determine level
    let currentLevel = 1;
    for (const levelData of XP_LEVELS) {
      if (xp >= levelData.totalXp) {
        currentLevel = levelData.level;
      } else {
        break;
      }
    }
    setLevel(currentLevel);

    // Check achievement unlocks
    checkAchievements();
  }, [completedExercises, sessionStats]);

  const checkAchievements = () => {
    const unlocked = [];

    if (completedExercises.length >= 10) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'stretch-warrior');
      unlocked.push(achievement);
    }

    if (sessionStats.postureScore > 90) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === 'perfect-posture-master');
      unlocked.push(achievement);
    }

    setUnlockedAchievements(unlocked);
  };

  const getCurrentLevel = () => {
    return XP_LEVELS.find((l) => l.level === level) || XP_LEVELS[0];
  };

  const getNextLevel = () => {
    return XP_LEVELS.find((l) => l.level === level + 1) || XP_LEVELS[XP_LEVELS.length - 1];
  };

  const currentLevelData = getCurrentLevel();
  const nextLevelData = getNextLevel();
  const xpToNextLevel = nextLevelData.totalXp - totalXP;
  const xpProgress = ((totalXP - currentLevelData.totalXp) / (nextLevelData.totalXp - currentLevelData.totalXp)) * 100;

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* XP & Level Display */}
      <GlassmorphicCard glow className="mb-6">
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          {/* Level Badge */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                border: '2px solid rgba(99, 102, 241, 0.5)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {level}
            </motion.div>
            <div className="text-xs text-slate-400 mt-2">{currentLevelData.name}</div>
          </motion.div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">Total XP</span>
                <span className="text-sm text-slate-400">{totalXP.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-900 bg-opacity-50 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {xpToNextLevel.toLocaleString()} XP to Level {level + 1}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {completedExercises.length}
              </div>
              <div className="text-xs text-slate-400">Exercises Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {unlockedAchievements.length}
              </div>
              <div className="text-xs text-slate-400">Achievements</div>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassmorphicCard glow>
            <h3 className="font-semibold mb-4">Unlocked achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  className="p-4 rounded-lg bg-slate-900 bg-opacity-40 border border-slate-700 border-opacity-50"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-sm">{achievement.name}</div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                  <div className="text-xs text-primary font-semibold">
                    +{achievement.xpReward} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}

      {/* Available Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassmorphicCard>
          <h3 className="font-semibold mb-4">Available achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.slice(0, 6).map((achievement) => {
              const isUnlocked = unlockedAchievements.some((a) => a.id === achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                    isUnlocked
                      ? 'bg-slate-900 bg-opacity-60'
                      : 'bg-slate-900 bg-opacity-30 opacity-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-xs font-semibold mb-1">{achievement.name}</div>
                  <div className="text-xs text-slate-400">{achievement.xpReward} XP</div>
                </motion.div>
              );
            })}
          </div>
        </GlassmorphicCard>
      </motion.div>
    </motion.div>
  );
};

export default GameificationDashboard;
