import { useState, useCallback, useRef, useEffect } from 'react';
import wellnessScorer from '../utils/wellness/wellnessScoring';
import burnoutPredictor from '../utils/wellness/burnoutPredictor';

/**
 * Custom hook for wellness score tracking
 */
export const useWellnessScore = () => {
  const [scores, setScores] = useState({
    postureScore: 0,
    eyeHealthScore: 0,
    focusScore: 0,
    fatigueScore: 0,
    productivityScore: 0,
    wellnessIndex: 0,
  });

  const updateScores = useCallback((metrics) => {
    const newScores = wellnessScorer.updateScores(metrics);
    setScores(newScores);
    return newScores;
  }, []);

  return { scores, updateScores };
};

/**
 * Custom hook for burnout prediction
 */
export const useBurnoutPrediction = () => {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const historicalDataRef = useRef({});

  const predictBurnout = useCallback((metrics) => {
    const risk = burnoutPredictor.predictBurnoutRisk(metrics, historicalDataRef.current);
    const level = burnoutPredictor.getRiskLevel(risk);
    const recs = burnoutPredictor.getRecommendations(risk, burnoutPredictor.riskFactors);

    setRiskScore(risk);
    setRiskLevel(level);
    setRecommendations(recs);

    return { riskScore: risk, riskLevel: level, recommendations: recs };
  }, []);

  return { riskScore, riskLevel, recommendations, predictBurnout };
};

/**
 * Custom hook for session tracking
 */
export const useSessionTracking = () => {
  const [sessionData, setSessionData] = useState({
    startTime: null,
    endTime: null,
    duration: 0,
    exercisesCompleted: [],
    metrics: {},
  });

  const startSession = useCallback(() => {
    setSessionData((prev) => ({
      ...prev,
      startTime: Date.now(),
    }));
  }, []);

  const endSession = useCallback(() => {
    setSessionData((prev) => ({
      ...prev,
      endTime: Date.now(),
      duration: (Date.now() - (prev.startTime || Date.now())) / 1000 / 60, // minutes
    }));
  }, []);

  const addExerciseCompletion = useCallback((exerciseName) => {
    setSessionData((prev) => ({
      ...prev,
      exercisesCompleted: [...prev.exercisesCompleted, { name: exerciseName, time: Date.now() }],
    }));
  }, []);

  return {
    sessionData,
    startSession,
    endSession,
    addExerciseCompletion,
  };
};

/**
 * Custom hook for localStorage persistence
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

/**
 * Custom hook for gamification tracking
 */
export const useGameification = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);
  const [streakDays, setStreakDays] = useState(0);

  const addXP = useCallback((amount) => {
    setXp((prev) => prev + amount);
  }, []);

  const unlockAchievement = useCallback((achievement) => {
    setAchievements((prev) => [...prev, achievement]);
    addXP(achievement.xpReward);
  }, [addXP]);

  const updateStreak = useCallback((newStreakDays) => {
    setStreakDays(newStreakDays);
  }, []);

  useEffect(() => {
    // Update level based on XP
    const xpThresholds = [0, 500, 1200, 2500, 4500, 7500, 11500, 16500, 22500, 30000];
    let newLevel = 1;

    for (let i = 0; i < xpThresholds.length; i++) {
      if (xp >= xpThresholds[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    setLevel(newLevel);
  }, [xp]);

  return {
    xp,
    level,
    achievements,
    streakDays,
    addXP,
    unlockAchievement,
    updateStreak,
  };
};

/**
 * Backwards-compatible aggregate hook.
 * Some components import `useWellness`; keep it as a thin wrapper.
 */
export const useWellness = () => {
  const wellness = useWellnessScore();
  const burnout = useBurnoutPrediction();
  const session = useSessionTracking();
  const gamification = useGameification();

  return { ...wellness, ...burnout, ...session, ...gamification };
};

export default {
  useWellnessScore,
  useBurnoutPrediction,
  useSessionTracking,
  useLocalStorage,
  useGameification,
  useWellness,
};
