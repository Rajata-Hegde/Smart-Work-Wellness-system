// Wellness Score Thresholds
export const WELLNESS_THRESHOLDS = {
  POSTURE: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 0,
  },
  EYE_HEALTH: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 0,
  },
  FOCUS: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 0,
  },
  FATIGUE: {
    LOW: 30,
    MODERATE: 60,
    HIGH: 80,
    CRITICAL: 100,
  },
  PRODUCTIVITY: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 0,
  },
};

// Burnout Risk Levels
export const BURNOUT_RISK_LEVELS = {
  LOW: { label: 'Low', color: '#10B981', threshold: 0.3 },
  MODERATE: { label: 'Moderate', color: '#F59E0B', threshold: 0.6 },
  HIGH: { label: 'High', color: '#EF4444', threshold: 0.8 },
  CRITICAL: { label: 'Critical', color: '#DC2626', threshold: 1.0 },
};

// Break Recommendations
export const BREAK_RECOMMENDATIONS = {
  STRETCH: {
    name: 'Quick Stretch',
    duration: 2,
    description: 'Stand up and stretch for 2 minutes',
    emoji: '🧘',
  },
  WALK: {
    name: 'Short Walk',
    duration: 5,
    description: 'Take a 5-minute walk around',
    emoji: '🚶',
  },
  EYES: {
    name: '20-20-20 Rule',
    duration: 1,
    description: 'Look 20 feet away for 20 seconds',
    emoji: '👁️',
  },
  WATER: {
    name: 'Hydration Break',
    duration: 2,
    description: 'Drink water and rest',
    emoji: '💧',
  },
  BREATHING: {
    name: 'Breathing Exercise',
    duration: 3,
    description: 'Deep breathing for calm focus',
    emoji: '🌬️',
  },
};

// Alert Priorities
export const ALERT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Session Duration Recommendations
export const SESSION_DURATIONS = {
  SHORT: 25, // Pomodoro
  MEDIUM: 50,
  LONG: 90,
  EXTENDED: 120,
};

// Prediction Windows
export const PREDICTION_WINDOWS = {
  IMMEDIATE: 2, // minutes
  NEAR: 5,
  MEDIUM: 15,
  FAR: 30,
};

// Trend Analysis Periods
export const TREND_PERIODS = {
  LAST_5_MIN: 5,
  LAST_15_MIN: 15,
  LAST_30_MIN: 30,
  LAST_1_HOUR: 60,
  LAST_2_HOURS: 120,
};

// Score Update Frequency
export const UPDATE_FREQUENCIES = {
  REAL_TIME: 500, // milliseconds
  FREQUENT: 2000,
  REGULAR: 5000,
  PERIODIC: 10000,
};

export default {
  WELLNESS_THRESHOLDS,
  BURNOUT_RISK_LEVELS,
  BREAK_RECOMMENDATIONS,
  ALERT_PRIORITY,
  SESSION_DURATIONS,
  PREDICTION_WINDOWS,
  TREND_PERIODS,
  UPDATE_FREQUENCIES,
};
