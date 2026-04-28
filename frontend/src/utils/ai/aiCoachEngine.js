// Smart AI Coach Engine
// Personalized recommendations and natural language responses

import { AI_RESPONSES, RECOMMENDATION_TRIGGERS } from '../../constants/aiResponses.js';

class AICoachEngine {
  constructor() {
    this.userProfile = {
      name: 'User',
      preferredStyle: 'motivational',
      sessionCount: 0,
      favoriteExercises: [],
      completedAchievements: [],
    };
    this.lastRecommendations = {};
    this.conversationHistory = [];
    this.recommendationCooldowns = {};
  }

  /**
   * Initialize user profile
   */
  initializeUser(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
  }

  /**
   * Get greeting message
   */
  getGreeting() {
    const greetings = AI_RESPONSES.greeting;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Get contextual response based on wellness metrics
   */
  getContextualResponse(metrics) {
    const { postureScore, focusScore, fatigueScore, eyeHealthScore } = metrics;

    if (fatigueScore > 70) {
      return this._getRandomResponse('yawn_detected');
    }

    if (postureScore < 60) {
      return this._getRandomResponse('posture_correction');
    }

    if (focusScore < 50) {
      return this._getRandomResponse('focus_alert');
    }

    if (eyeHealthScore < 60) {
      return this._getRandomResponse('eye_fatigue');
    }

    if (postureScore > 85 && focusScore > 85 && fatigueScore < 30) {
      return this._getRandomResponse('productivity_boost');
    }

    return null;
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(currentMetrics, historicalData = {}) {
    const recommendations = [];

    // Check each trigger condition
    if (currentMetrics.postureScore < RECOMMENDATION_TRIGGERS.posture_poor.threshold) {
      if (this._checkCooldown('posture_poor', RECOMMENDATION_TRIGGERS.posture_poor.frequency)) {
        recommendations.push({
          type: 'posture',
          title: 'Posture Correction',
          message: this._getRandomResponse('posture_correction'),
          priority: RECOMMENDATION_TRIGGERS.posture_poor.priority,
          action: 'exercise',
          exerciseType: this._suggestPostureExercise(currentMetrics),
        });
      }
    }

    if (currentMetrics.eyeHealthScore < RECOMMENDATION_TRIGGERS.blink_low.threshold) {
      if (this._checkCooldown('eye_health', RECOMMENDATION_TRIGGERS.blink_low.frequency)) {
        recommendations.push({
          type: 'eyes',
          title: 'Eye Rest Break',
          message: this._getRandomResponse('eye_fatigue'),
          priority: RECOMMENDATION_TRIGGERS.blink_low.priority,
          action: 'break',
          breakType: '20-20-20',
          duration: 1,
        });
      }
    }

    if (currentMetrics.focusScore < RECOMMENDATION_TRIGGERS.focus_lost.threshold) {
      if (this._checkCooldown('focus', RECOMMENDATION_TRIGGERS.focus_lost.frequency)) {
        recommendations.push({
          type: 'focus',
          title: 'Refocus Needed',
          message: this._getRandomResponse('focus_alert'),
          priority: RECOMMENDATION_TRIGGERS.focus_lost.priority,
          action: 'refocus',
        });
      }
    }

    if (currentMetrics.fatigueScore > RECOMMENDATION_TRIGGERS.fatigue_high.threshold) {
      if (this._checkCooldown('fatigue', RECOMMENDATION_TRIGGERS.fatigue_high.frequency)) {
        recommendations.push({
          type: 'fatigue',
          title: 'Fatigue Detected',
          message: this._getRandomResponse('break_recommendation'),
          priority: RECOMMENDATION_TRIGGERS.fatigue_high.priority,
          action: 'break',
          duration: 5,
        });
      }
    }

    return recommendations;
  }

  /**
   * Suggest specific posture exercise
   */
  _suggestPostureExercise(metrics) {
    const { forwardHeadPosture = 0, slouching = 0 } = metrics;

    if (forwardHeadPosture > slouching) {
      return 'neck_stretch';
    } else {
      return 'back_extension';
    }
  }

  /**
   * Check if recommendation is in cooldown
   */
  _checkCooldown(key, frequencyMinutes) {
    const now = Date.now();
    const lastTime = this.recommendationCooldowns[key] || 0;
    const cooldownMs = frequencyMinutes * 60 * 1000;

    if (now - lastTime >= cooldownMs) {
      this.recommendationCooldowns[key] = now;
      return true;
    }

    return false;
  }

  /**
   * Get random response from category
   */
  _getRandomResponse(category) {
    const responses = AI_RESPONSES[category] || [];
    if (responses.length === 0) return 'Keep it up!';
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Provide encouragement
   */
  getEncouragement() {
    return this._getRandomResponse('exercise_motivation');
  }

  /**
   * Acknowledge milestone
   */
  getMilestoneMessage() {
    return this._getRandomResponse('wellness_milestone');
  }

  /**
   * Get session end message
   */
  getSessionEndMessage() {
    return this._getRandomResponse('session_end');
  }

  /**
   * Add to conversation history
   */
  addToHistory(role, message) {
    this.conversationHistory.push({
      role,
      message,
      timestamp: Date.now(),
    });

    // Keep only last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get personalized intro based on time of day
   */
  getTimeBasedGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning. Let's start your day with strong wellness habits.";
    } else if (hour < 17) {
      return 'Good afternoon. Keep up the good work.';
    } else {
      return 'Good evening. Let’s finish strong.';
    }
  }

  /**
   * Generate habit-based tips
   */
  generateHabitTip(completedAchievements) {
    const tips = [
      'Tip: Maintain a neutral posture while working.',
      'Tip: Use the 20-20-20 rule regularly to reduce eye strain.',
      'Tip: Stretch briefly every 30 minutes.',
      'Tip: Stay hydrated to support focus and reduce fatigue.',
      'Tip: A short walk can improve recovery and productivity.',
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Reset for new session
   */
  resetSession() {
    this.conversationHistory = [];
    this.recommendationCooldowns = {};
  }
}

export default new AICoachEngine();
