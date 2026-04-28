// Predictive Burnout Detection Engine
// ML-inspired algorithms to predict burnout before it happens

import { BURNOUT_RISK_LEVELS, PREDICTION_WINDOWS, TREND_PERIODS } from '../../constants/wellnessThresholds.js';

class BurnoutPredictor {
  constructor() {
    this.sessionMetrics = [];
    this.maxSessions = 50;
    this.riskFactors = {
      blinkTrend: 0,
      yawnFrequency: 0,
      focusDegradation: 0,
      postureDecline: 0,
      sessionDuration: 0,
      fatigueEscalation: 0,
    };
  }

  /**
   * Calculate blink rate trend (declining blink = higher risk)
   */
  calculateBlinkTrend(blinkHistory) {
    if (blinkHistory.length < 5) return 0;

    const recent = blinkHistory.slice(-5);
    const older = blinkHistory.slice(-10, -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const decline = Math.max(0, olderAvg - recentAvg);
    return Math.min(100, (decline / olderAvg) * 100);
  }

  /**
   * Calculate yawn frequency risk
   * Higher frequency = higher burnout risk
   */
  calculateYawnRisk(yawnData) {
    const { totalYawns = 0, timeElapsedMinutes = 1 } = yawnData;
    const yawnsPerMinute = totalYawns / Math.max(1, timeElapsedMinutes);

    // Normal: 0-1 yawn per minute
    // Risk: 1-2 yawns per minute
    // High risk: >2 yawns per minute
    return Math.min(100, yawnsPerMinute * 40);
  }

  /**
   * Calculate focus degradation over session
   */
  calculateFocusDegradation(focusHistory) {
    if (focusHistory.length < 10) return 0;

    const windowSize = Math.floor(focusHistory.length / 3);
    const first = focusHistory.slice(0, windowSize);
    const last = focusHistory.slice(-windowSize);

    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;

    const degradation = Math.max(0, firstAvg - lastAvg);
    return Math.min(100, (degradation / 100) * 100);
  }

  /**
   * Calculate posture decline risk
   */
  calculatePostureDecline(postureHistory) {
    if (postureHistory.length < 10) return 0;

    const windowSize = Math.floor(postureHistory.length / 3);
    const first = postureHistory.slice(0, windowSize);
    const last = postureHistory.slice(-windowSize);

    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;

    const decline = Math.max(0, firstAvg - lastAvg);
    return Math.min(100, (decline / 100) * 100);
  }

  /**
   * Calculate fatigue escalation risk
   */
  calculateFatigueEscalation(fatigueHistory) {
    if (fatigueHistory.length < 5) return 0;

    const recent = fatigueHistory.slice(-5);
    const older = fatigueHistory.slice(-10, -5);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const escalation = Math.max(0, recentAvg - olderAvg);
    return Math.min(100, escalation);
  }

  /**
   * Predict burnout risk (0-100)
   */
  predictBurnoutRisk(currentMetrics, historicalData) {
    const weights = {
      blinkTrend: 0.2,
      yawnFrequency: 0.15,
      focusDegradation: 0.25,
      postureDecline: 0.15,
      sessionDuration: 0.1,
      fatigueEscalation: 0.15,
    };

    this.riskFactors = {
      blinkTrend: this.calculateBlinkTrend(historicalData.blinkRate || []),
      yawnFrequency: this.calculateYawnRisk(currentMetrics.yawnData || {}),
      focusDegradation: this.calculateFocusDegradation(historicalData.focus || []),
      postureDecline: this.calculatePostureDecline(historicalData.posture || []),
      sessionDuration: Math.min(100, (currentMetrics.sessionMinutes || 0) / 2),
      fatigueEscalation: this.calculateFatigueEscalation(historicalData.fatigue || []),
    };

    let riskScore = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      riskScore += this.riskFactors[factor] * weight;
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Get burnout risk level
   */
  getRiskLevel(riskScore) {
    if (riskScore < BURNOUT_RISK_LEVELS.MODERATE.threshold * 100)
      return BURNOUT_RISK_LEVELS.LOW;
    if (riskScore < BURNOUT_RISK_LEVELS.HIGH.threshold * 100)
      return BURNOUT_RISK_LEVELS.MODERATE;
    if (riskScore < BURNOUT_RISK_LEVELS.CRITICAL.threshold * 100)
      return BURNOUT_RISK_LEVELS.HIGH;
    return BURNOUT_RISK_LEVELS.CRITICAL;
  }

  /**
   * Predict burnout timeline
   * Returns minutes until predicted burnout
   */
  predictBurnoutTimeline(riskScore, degradationRate) {
    if (riskScore < 50) return null; // Low risk, no prediction

    const riskPerMinute = degradationRate || 0.5;
    const minutesToCritical = Math.max(1, (100 - riskScore) / riskPerMinute);

    return Math.min(60, Math.max(2, Math.round(minutesToCritical)));
  }

  /**
   * Get personalized recommendations based on risk
   */
  getRecommendations(riskScore, riskFactors) {
    const recommendations = [];

    if (riskFactors.blinkTrend > 40) {
      recommendations.push({
        priority: 'high',
        action: 'Take a 20-20-20 eye break',
        reason: 'Your blink rate is declining significantly',
        duration: 1,
      });
    }

    if (riskFactors.yawnFrequency > 50) {
      recommendations.push({
        priority: 'critical',
        action: 'Take a 5-10 minute rest',
        reason: 'High frequency of yawns detected',
        duration: 5,
      });
    }

    if (riskFactors.focusDegradation > 30) {
      recommendations.push({
        priority: 'medium',
        action: 'Try a quick meditation or breathing exercise',
        reason: 'Your focus is gradually declining',
        duration: 3,
      });
    }

    if (riskFactors.postureDecline > 30) {
      recommendations.push({
        priority: 'medium',
        action: 'Perform posture-correcting exercises',
        reason: 'Your posture has significantly declined',
        duration: 5,
      });
    }

    if (riskFactors.sessionDuration > 70) {
      recommendations.push({
        priority: 'high',
        action: 'Take a longer break or end session',
        reason: "You've been working for an extended period",
        duration: 15,
      });
    }

    if (riskScore > 70) {
      recommendations.push({
        priority: 'critical',
        action: 'Take an extended break NOW',
        reason: 'Burnout risk is critically high',
        duration: 30,
      });
    }

    return recommendations;
  }

  /**
   * Store session metrics
   */
  recordSession(sessionData) {
    this.sessionMetrics.push({
      timestamp: Date.now(),
      ...sessionData,
    });

    if (this.sessionMetrics.length > this.maxSessions) {
      this.sessionMetrics.shift();
    }
  }

  /**
   * Get historical trends
   */
  getHistoricalTrends() {
    if (this.sessionMetrics.length < 2) return null;

    const recent = this.sessionMetrics.slice(-5);
    const avgRiskScore = recent.reduce((a, b) => a + (b.riskScore || 0), 0) / recent.length;
    const trend =
      recent[recent.length - 1].riskScore > recent[0].riskScore ? 'worsening' : 'improving';

    return {
      avgRiskScore,
      trend,
      sessionsTracked: this.sessionMetrics.length,
    };
  }

  /**
   * Reset for new session
   */
  resetSession() {
    this.riskFactors = {
      blinkTrend: 0,
      yawnFrequency: 0,
      focusDegradation: 0,
      postureDecline: 0,
      sessionDuration: 0,
      fatigueEscalation: 0,
    };
  }
}

const burnoutPredictor = new BurnoutPredictor();

export const predictBurnout = (scoreHistory, sessionData) => {
  if (!scoreHistory || scoreHistory.length === 0) {
    return {
      riskScore: 0,
      riskLevel: 'low',
      recommendations: [],
      timeline: null,
    };
  }

  const currentMetrics = scoreHistory[scoreHistory.length - 1] || {};
  const historicalData = {
    posture: scoreHistory.map(s => s.posture || 0),
    eyeHealth: scoreHistory.map(s => s.eyeHealth || 0),
    focus: scoreHistory.map(s => s.focus || 0),
    fatigue: scoreHistory.map(s => s.fatigue || 0),
  };

  const riskScore = burnoutPredictor.predictBurnoutRisk(currentMetrics, historicalData);
  const riskLevel = burnoutPredictor.getRiskLevel(riskScore);
  const timeline = burnoutPredictor.predictBurnoutTimeline(
    riskScore,
    (scoreHistory.length > 1 ? Math.abs(scoreHistory[scoreHistory.length - 1].wellnessIndex - scoreHistory[scoreHistory.length - 2].wellnessIndex) : 0) / 10
  );
  const recommendations = burnoutPredictor.getRecommendations(riskScore, burnoutPredictor.riskFactors);

  return {
    riskScore,
    riskLevel,
    recommendations,
    timeline,
  };
};

export default burnoutPredictor;
