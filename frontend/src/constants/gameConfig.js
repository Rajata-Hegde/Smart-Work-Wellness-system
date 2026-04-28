// Game Configuration and Achievements

export const ACHIEVEMENTS = [
  {
    id: 'perfect-posture-master',
    name: 'Perfect Posture Master',
    description: 'Maintain 90+ posture score for 30 continuous minutes',
    icon: '🧘',
    xpReward: 500,
    rarity: 'legendary',
    requirement: { type: 'posture', value: 90, duration: 30 },
  },
  {
    id: 'blink-champion',
    name: 'Blink Champion',
    description: 'Maintain healthy blink rate for 1 hour',
    icon: '👁️',
    xpReward: 400,
    rarity: 'epic',
    requirement: { type: 'blink', value: 15, duration: 60 },
  },
  {
    id: 'focus-ninja',
    name: 'Focus Ninja',
    description: 'Achieve 90+ focus score 5 times in a session',
    icon: '🥷',
    xpReward: 350,
    rarity: 'epic',
    requirement: { type: 'focus', value: 5, count: 5 },
  },
  {
    id: 'stretch-warrior',
    name: 'Stretch Warrior',
    description: 'Complete 10 corrective exercises in a day',
    icon: '💪',
    xpReward: 300,
    rarity: 'rare',
    requirement: { type: 'exercises', value: 10 },
  },
  {
    id: 'break-taker',
    name: 'Break Taker',
    description: 'Take 20 recommended breaks',
    icon: '☕',
    xpReward: 250,
    rarity: 'rare',
    requirement: { type: 'breaks', value: 20 },
  },
  {
    id: 'hydration-hero',
    name: 'Hydration Hero',
    description: 'Complete 15 hydration reminders',
    icon: '💧',
    xpReward: 200,
    rarity: 'uncommon',
    requirement: { type: 'hydration', value: 15 },
  },
  {
    id: 'wellness-streak-3',
    name: 'Streak Starter',
    description: 'Maintain a 3-day wellness streak',
    icon: '🔥',
    xpReward: 300,
    rarity: 'rare',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'wellness-streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day wellness streak',
    icon: '🔥🔥',
    xpReward: 600,
    rarity: 'epic',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'wellness-streak-30',
    name: 'Month Master',
    description: 'Maintain a 30-day wellness streak',
    icon: '🏆',
    xpReward: 1500,
    rarity: 'legendary',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Log in before 7 AM for 5 consecutive days',
    icon: '🌅',
    xpReward: 250,
    rarity: 'uncommon',
    requirement: { type: 'morning', value: 5 },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Log in after 10 PM for 5 consecutive days',
    icon: '🌙',
    xpReward: 250,
    rarity: 'uncommon',
    requirement: { type: 'night', value: 5 },
  },
  {
    id: 'productivity-peak',
    name: 'Productivity Peak',
    description: 'Achieve 90+ productivity score in a session',
    icon: '📈',
    xpReward: 400,
    rarity: 'epic',
    requirement: { type: 'productivity', value: 90 },
  },
];

export const XP_LEVELS = [
  { level: 1, totalXp: 0, name: 'Newbie' },
  { level: 2, totalXp: 500, name: 'Beginner' },
  { level: 3, totalXp: 1200, name: 'Intermediate' },
  { level: 4, totalXp: 2500, name: 'Advanced' },
  { level: 5, totalXp: 4500, name: 'Expert' },
  { level: 6, totalXp: 7500, name: 'Master' },
  { level: 7, totalXp: 11500, name: 'Guru' },
  { level: 8, totalXp: 16500, name: 'Legend' },
  { level: 9, totalXp: 22500, name: 'Immortal' },
  { level: 10, totalXp: 30000, name: 'Supreme' },
];

export const DAILY_CHALLENGES = [
  {
    id: 'posture-perfect',
    name: 'Posture Perfect',
    description: 'Maintain 85+ posture score for 30 minutes',
    xpReward: 100,
    difficulty: 'medium',
    streak: 2,
  },
  {
    id: 'exercise-warrior',
    name: 'Exercise Warrior',
    description: 'Complete 3 corrective exercises',
    xpReward: 75,
    difficulty: 'easy',
    streak: 1.5,
  },
  {
    id: 'focus-master',
    name: 'Focus Master',
    description: 'Achieve 90+ focus score 3 times',
    xpReward: 100,
    difficulty: 'hard',
    streak: 2,
  },
  {
    id: 'break-disciplined',
    name: 'Break Disciplined',
    description: 'Take 5 recommended breaks',
    xpReward: 60,
    difficulty: 'easy',
    streak: 1,
  },
  {
    id: 'eye-champion',
    name: 'Eye Champion',
    description: 'Maintain healthy blink rate for 1 hour',
    xpReward: 120,
    difficulty: 'hard',
    streak: 2.5,
  },
];

export const XP_REWARDS = {
  GOOD_POSTURE: 5,
  EXERCISE_COMPLETED: 50,
  BREAK_TAKEN: 20,
  HYDRATION_REMINDER: 10,
  FOCUS_MILESTONE: 25,
  SESSION_COMPLETED: 100,
  PERFECT_SESSION: 250,
  ACHIEVEMENT_UNLOCKED: (rarity) => {
    const rarityMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5,
    };
    return 100 * (rarityMultiplier[rarity] || 1);
  },
};

export const LEADERBOARD_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALL_TIME: 'all_time',
};

export const RARITY_COLORS = {
  common: '#6B7280',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export const GAME_CONFIG = {
  maxStreakBonus: 1.5,
  maxComboBonus: 2.0,
  dailyChallengeResetHour: 0,
  leaderboardUpdateInterval: 3600000, // 1 hour
  seasonDuration: 2592000000, // 30 days
};

export default {
  ACHIEVEMENTS,
  XP_LEVELS,
  DAILY_CHALLENGES,
  XP_REWARDS,
  LEADERBOARD_PERIODS,
  RARITY_COLORS,
  GAME_CONFIG,
};
