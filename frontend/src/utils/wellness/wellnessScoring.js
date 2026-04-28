// Advanced Wellness Scoring System
// 6-dimensional scoring with real-time calculations and trend analysis

import { WELLNESS_THRESHOLDS, TREND_PERIODS } from '../../constants/wellnessThresholds.js';

class WellnessScorer {
  constructor() {
    this.scoreHistory = {
      posture: [],
      eyeHealth: [],
      focus: [],
      fatigue: [],
      productivity: [],
    };
    this.maxHistoryLength = 1000;
  }

  /**
   * Calculate Posture Score (0-100)
   * Based on body alignment, forward head, slouching
   */
  calculatePostureScore(postureLandmarks) {
    if (!postureLandmarks) return 0;

    let score = 100;

    // Forward head penalty
    const headForwardness = postureLandmarks.headForwardness || 0;
    score -= headForwardness * 0.5;

    // Slouching penalty
    const slouch = postureLandmarks.slouch || 0;
    score -= slouch * 0.3;

    // Alignment score
    const alignment = postureLandmarks.alignment || 50;
    score = (score * 0.3) + (alignment * 0.7);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate Eye Health Score (0-100)
   * Based on blink rate, eye openness, fatigue indicators
   */
  calculateEyeHealthScore(eyeMetrics) {
    if (!eyeMetrics) return 50;

    let score = 100;

    // Optimal blink rate: 15-20 per minute
    const blinkRate = eyeMetrics.blinkRate || 0;
    const blinkDiff = Math.abs(blinkRate - 17.5);
    score -= Math.min(40, blinkDiff * 3);

    // Eye fatigue penalty
    const fatigue = eyeMetrics.eyeFatigue ? 30 : 0;
    score -= fatigue;

    // Eye openness (indicates alertness)
    const eyeOpenness = eyeMetrics.eyeOpenness || 50;
    score += eyeOpenness * 0.1;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate Focus Score (0-100)
   * Based on gaze direction, attention level, distraction
   */
  calculateFocusScore(attentionMetrics) {
    if (!attentionMetrics) return 50;

    let score = 100;

    // Screen focus percentage
    const screenFocus = attentionMetrics.screenFocusPercentage || 0;
    score = (screenFocus * 0.6) + 40;

    // Head movement (higher = more distracted)
    const headMovement = attentionMetrics.headMovement || 0;
    score -= headMovement * 0.5;

    // Attention stability
    const stability = attentionMetrics.attentionStability || 50;
    score += (stability - 50) * 0.2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate Fatigue Score (0-100, higher = more fatigued)
   * Based on yawns, blink frequency, eye closure duration
   */
  calculateFatigueScore(fatigueMetrics, recentHistory = []) {
    if (!fatigueMetrics) return 30;

    let score = 0;

    // Yawn frequency
    const yawns = fatigueMetrics.yawnCount || 0;
    score += Math.min(40, yawns * 15);

    // Eye closure duration
    const avgEyeClosureDuration = fatigueMetrics.avgEyeClosureDuration || 0;
    score += Math.min(30, avgEyeClosureDuration * 2);

    // Blink rate changes (sudden increase indicates fatigue)
    if (recentHistory.length > 2) {
      const blinkTrend = recentHistory[recentHistory.length - 1] - recentHistory[0];
      if (blinkTrend > 5) score += 15;
    }

    // Session duration (fatigue increases with time)
    const sessionMinutes = fatigueMetrics.sessionMinutes || 0;
    score += Math.min(20, (sessionMinutes / 60) * 10);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate Productivity Score (0-100)
   * Based on focus, posture, and fatigue combined
   */
  calculateProductivityScore(scores) {
    const { posture, focus, fatigue, eyeHealth } = scores;

    // Productivity is high when focus and posture are good, fatigue is low
    let productivity = (posture * 0.3) + (focus * 0.4) + (eyeHealth * 0.15);
    productivity -= (fatigue * 0.15);

    return Math.max(0, Math.min(100, Math.round(productivity)));
  }

  /**
   * Calculate Overall Wellness Index (0-100)
   * Weighted average of all dimensions
   */
  calculateWellnessIndex(scores) {
    const { posture, eyeHealth, focus, fatigue, productivity } = scores;

    const index =
      (posture * 0.25) +
      (eyeHealth * 0.20) +
      (focus * 0.25) +
      ((100 - fatigue) * 0.15) + // Inverse fatigue
      (productivity * 0.15);

    return Math.max(0, Math.min(100, Math.round(index)));
  }

  /**
   * Update score history and return current scores
   */
  updateScores(metrics) {
    const postureScore = this.calculatePostureScore(metrics.posture);
    const eyeHealthScore = this.calculateEyeHealthScore(metrics.eyes);
    const focusScore = this.calculateFocusScore(metrics.attention);
    const fatigueScore = this.calculateFatigueScore(
      metrics.fatigue,
      this.scoreHistory.eyeHealth
    );
    const productivityScore = this.calculateProductivityScore({
      posture: postureScore,
      eyeHealth: eyeHealthScore,
      focus: focusScore,
      fatigue: fatigueScore,
    });
    const wellnessIndex = this.calculateWellnessIndex({
      posture: postureScore,
      eyeHealth: eyeHealthScore,
      focus: focusScore,
      fatigue: fatigueScore,
      productivity: productivityScore,
    });

    // Update history
    this._updateHistory('posture', postureScore);
    this._updateHistory('eyeHealth', eyeHealthScore);
    this._updateHistory('focus', focusScore);
    this._updateHistory('fatigue', fatigueScore);
    this._updateHistory('productivity', productivityScore);

    return {
      postureScore,
      eyeHealthScore,
      focusScore,
      fatigueScore,
      productivityScore,
      wellnessIndex,
      timestamp: Date.now(),
    };
  }

  _updateHistory(key, value) {
    if (!this.scoreHistory[key]) {
      this.scoreHistory[key] = [];
    }
    this.scoreHistory[key].push(value);

    if (this.scoreHistory[key].length > this.maxHistoryLength) {
      this.scoreHistory[key].shift();
    }
  }

  /**
   * Get trend for a specific metric
   */
  getTrend(metric, periodMinutes = 5) {
    const history = this.scoreHistory[metric] || [];
    const windowSize = Math.max(1, Math.floor(history.length * (periodMinutes / 30)));

    if (history.length < 2) return { trend: 'stable', percentage: 0 };

    const recent = history.slice(-windowSize);
    const older = history.slice(-windowSize * 2, -windowSize);

    if (older.length === 0) return { trend: 'stable', percentage: 0 };

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    return {
      trend: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
      percentage: Math.abs(change),
      value: change,
    };
  }

  /**
   * Get insights about current state
   */
  getInsights() {
    const insights = [];

    const postureTrend = this.getTrend('posture');
    if (postureTrend.trend === 'declining') {
      insights.push({
        type: 'warning',
        message: 'Your posture is getting worse. Take a quick break!',
        priority: 'high',
      });
    }

    const fatigueTrend = this.getTrend('fatigue');
    if (fatigueTrend.trend === 'improving' && fatigueTrend.percentage > 15) {
      insights.push({
        type: 'positive',
        message: 'Your fatigue level is improving! Keep it up!',
        priority: 'low',
      });
    }

    const focusTrend = this.getTrend('focus');
    if (focusTrend.trend === 'declining') {
      insights.push({
        type: 'warning',
        message: 'Your focus seems to be slipping. Try a quick exercise!',
        priority: 'medium',
      });
    }

    return insights;
  }

  /**
   * Get score categories
   */
  getScoreCategory(metric, score) {
    const thresholds = WELLNESS_THRESHOLDS[metric.toUpperCase()];

    if (score >= thresholds.EXCELLENT) return 'excellent';
    if (score >= thresholds.GOOD) return 'good';
    if (score >= thresholds.FAIR) return 'fair';
    return 'poor';
  }

  /**
   * Reset history
   */
  resetHistory() {
    this.scoreHistory = {
      posture: [],
      eyeHealth: [],
      focus: [],
      fatigue: [],
      productivity: [],
    };
  }
}

const wellnessScorer = new WellnessScorer();

export const calculateWellnessScores = (poseLandmarks, faceLandmarks, scoreHistory) => {
  const postureScore = wellnessScorer.calculatePostureScore(poseLandmarks);
  const eyeHealthScore = wellnessScorer.calculateEyeHealthScore(faceLandmarks);
  const focusScore = wellnessScorer.calculateFocusScore(faceLandmarks);
  const fatigueScore = wellnessScorer.calculateFatigueScore(faceLandmarks);
  const productivityScore = wellnessScorer.calculateProductivityScore(scoreHistory);
  const wellnessIndex = wellnessScorer.calculateWellnessIndex(
    postureScore,
    eyeHealthScore,
    focusScore,
    fatigueScore,
    productivityScore
  );

  return {
    posture: postureScore,
    eyeHealth: eyeHealthScore,
    focus: focusScore,
    fatigue: fatigueScore,
    productivity: productivityScore,
    wellnessIndex,
  };
};

export default wellnessScorer;
