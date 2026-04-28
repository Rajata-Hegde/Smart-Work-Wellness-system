"""
Wellness Scoring Service
Advanced 6-dimensional wellness scoring with ML-inspired algorithms
"""

import json
from datetime import datetime
import numpy as np


class WellnessScorer:
    """Calculates comprehensive wellness scores"""

    @staticmethod
    def calculate_posture_score(landmarks):
        """Calculate posture score (0-100)"""
        if not landmarks:
            return 0

        score = 100

        # Forward head penalty
        head_forwardness = landmarks.get('headForwardness', 0)
        score -= head_forwardness * 0.5

        # Slouching penalty
        slouch = landmarks.get('slouch', 0)
        score -= slouch * 0.3

        # Alignment score
        alignment = landmarks.get('alignment', 50)
        score = (score * 0.3) + (alignment * 0.7)

        return max(0, min(100, int(score)))

    @staticmethod
    def calculate_eye_health_score(eye_metrics):
        """Calculate eye health score (0-100)"""
        if not eye_metrics:
            return 50

        score = 100

        # Optimal blink rate: 15-20 per minute
        blink_rate = eye_metrics.get('blinkRate', 0)
        blink_diff = abs(blink_rate - 17.5)
        score -= min(40, blink_diff * 3)

        # Eye fatigue penalty
        fatigue = 30 if eye_metrics.get('eyeFatigue', False) else 0
        score -= fatigue

        # Eye openness
        eye_openness = eye_metrics.get('eyeOpenness', 50)
        score += eye_openness * 0.1

        return max(0, min(100, int(score)))

    @staticmethod
    def calculate_focus_score(attention_metrics):
        """Calculate focus score (0-100)"""
        if not attention_metrics:
            return 50

        score = 100

        # Screen focus percentage
        screen_focus = attention_metrics.get('screenFocusPercentage', 0)
        score = (screen_focus * 0.6) + 40

        # Head movement
        head_movement = attention_metrics.get('headMovement', 0)
        score -= head_movement * 0.5

        # Attention stability
        stability = attention_metrics.get('attentionStability', 50)
        score += (stability - 50) * 0.2

        return max(0, min(100, int(score)))

    @staticmethod
    def calculate_fatigue_score(fatigue_metrics, recent_blinks=[]):
        """Calculate fatigue score (0-100, higher = more fatigued)"""
        if not fatigue_metrics:
            return 30

        score = 0

        # Yawn frequency
        yawns = fatigue_metrics.get('yawnCount', 0)
        score += min(40, yawns * 15)

        # Eye closure duration
        avg_closure = fatigue_metrics.get('avgEyeClosureDuration', 0)
        score += min(30, avg_closure * 2)

        # Blink rate changes
        if len(recent_blinks) > 2:
            blink_trend = recent_blinks[-1] - recent_blinks[0]
            if blink_trend > 5:
                score += 15

        # Session duration
        session_minutes = fatigue_metrics.get('sessionMinutes', 0)
        score += min(20, (session_minutes / 60) * 10)

        return max(0, min(100, int(score)))

    @staticmethod
    def calculate_productivity_score(scores):
        """Calculate productivity score (0-100)"""
        posture = scores.get('postureScore', 0)
        focus = scores.get('focusScore', 0)
        fatigue = scores.get('fatigueScore', 0)
        eye_health = scores.get('eyeHealthScore', 0)

        productivity = (posture * 0.3) + (focus * 0.4) + (eye_health * 0.15)
        productivity -= (fatigue * 0.15)

        return max(0, min(100, int(productivity)))

    @staticmethod
    def calculate_wellness_index(scores):
        """Calculate overall wellness index (0-100)"""
        posture = scores.get('postureScore', 0)
        eye_health = scores.get('eyeHealthScore', 0)
        focus = scores.get('focusScore', 0)
        fatigue = scores.get('fatigueScore', 0)
        productivity = scores.get('productivityScore', 0)

        index = (
            (posture * 0.25) +
            (eye_health * 0.20) +
            (focus * 0.25) +
            ((100 - fatigue) * 0.15) +
            (productivity * 0.15)
        )

        return max(0, min(100, int(index)))

    @staticmethod
    def get_score_insights(scores, score_history={}):
        """Generate insights based on scores"""
        insights = []

        if scores.get('postureScore', 0) < 60:
            insights.append({
                'type': 'warning',
                'message': 'Your posture needs improvement. Take a stretch break!',
                'priority': 'high'
            })

        if scores.get('eyeHealthScore', 0) < 60:
            insights.append({
                'type': 'warning',
                'message': 'Eye fatigue detected. Follow the 20-20-20 rule.',
                'priority': 'medium'
            })

        if scores.get('focusScore', 0) < 50:
            insights.append({
                'type': 'warning',
                'message': 'Focus level is low. Consider a short break.',
                'priority': 'medium'
            })

        if scores.get('fatigueScore', 0) > 70:
            insights.append({
                'type': 'critical',
                'message': 'High fatigue detected. Take an extended break now.',
                'priority': 'critical'
            })

        if scores.get('wellnessIndex', 0) > 80:
            insights.append({
                'type': 'positive',
                'message': 'Excellent wellness status! Keep maintaining this.',
                'priority': 'low'
            })

        return insights


def create_wellness_service():
    """Factory function to create wellness service"""
    return WellnessScorer()
