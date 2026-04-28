"""
Burnout Predictor Service
ML-inspired burnout prediction and risk assessment
"""

import math
from enum import Enum


class BurnoutRiskLevel(Enum):
    LOW = ("Low", "#10B981", 0.3)
    MODERATE = ("Moderate", "#F59E0B", 0.6)
    HIGH = ("High", "#EF4444", 0.8)
    CRITICAL = ("Critical", "#DC2626", 1.0)


class BurnoutPredictorService:
    """Predicts burnout risk using ML-inspired algorithms"""

    def __init__(self):
        self.session_history = []
        self.max_sessions = 50
        self.risk_factors = {}

    def calculate_blink_trend(self, blink_history):
        """Calculate blink rate decline risk"""
        if len(blink_history) < 5:
            return 0

        recent = blink_history[-5:]
        older = blink_history[-10:-5] if len(blink_history) >= 10 else recent

        recent_avg = sum(recent) / len(recent)
        older_avg = sum(older) / len(older) if older else recent_avg

        decline = max(0, older_avg - recent_avg)
        return min(100, (decline / max(older_avg, 1)) * 100)

    def calculate_yawn_risk(self, yawn_data):
        """Calculate yawn frequency risk"""
        total_yawns = yawn_data.get('totalYawns', 0)
        time_elapsed = max(1, yawn_data.get('timeElapsedMinutes', 1))

        yawns_per_minute = total_yawns / time_elapsed
        return min(100, yawns_per_minute * 40)

    def calculate_focus_degradation(self, focus_history):
        """Calculate focus decline over session"""
        if len(focus_history) < 10:
            return 0

        window_size = max(1, len(focus_history) // 3)
        first = focus_history[:window_size]
        last = focus_history[-window_size:]

        first_avg = sum(first) / len(first)
        last_avg = sum(last) / len(last)

        degradation = max(0, first_avg - last_avg)
        return min(100, (degradation / 100) * 100)

    def calculate_posture_decline(self, posture_history):
        """Calculate posture decline"""
        if len(posture_history) < 10:
            return 0

        window_size = max(1, len(posture_history) // 3)
        first = posture_history[:window_size]
        last = posture_history[-window_size:]

        first_avg = sum(first) / len(first)
        last_avg = sum(last) / len(last)

        decline = max(0, first_avg - last_avg)
        return min(100, (decline / 100) * 100)

    def calculate_fatigue_escalation(self, fatigue_history):
        """Calculate fatigue escalation"""
        if len(fatigue_history) < 5:
            return 0

        recent = fatigue_history[-5:]
        older = fatigue_history[-10:-5] if len(fatigue_history) >= 10 else recent

        recent_avg = sum(recent) / len(recent)
        older_avg = sum(older) / len(older) if older else recent_avg

        escalation = max(0, recent_avg - older_avg)
        return min(100, escalation)

    def predict_burnout_risk(self, current_metrics, historical_data):
        """Predict burnout risk (0-100)"""
        weights = {
            'blink_trend': 0.2,
            'yawn_frequency': 0.15,
            'focus_degradation': 0.25,
            'posture_decline': 0.15,
            'session_duration': 0.1,
            'fatigue_escalation': 0.15,
        }

        self.risk_factors = {
            'blink_trend': self.calculate_blink_trend(
                historical_data.get('blinkRate', [])
            ),
            'yawn_frequency': self.calculate_yawn_risk(
                current_metrics.get('yawnData', {})
            ),
            'focus_degradation': self.calculate_focus_degradation(
                historical_data.get('focus', [])
            ),
            'posture_decline': self.calculate_posture_decline(
                historical_data.get('posture', [])
            ),
            'session_duration': min(100, (current_metrics.get('sessionMinutes', 0) / 2)),
            'fatigue_escalation': self.calculate_fatigue_escalation(
                historical_data.get('fatigue', [])
            ),
        }

        risk_score = 0
        for factor, weight in weights.items():
            risk_score += self.risk_factors[factor] * weight

        return min(100, max(0, risk_score))

    def get_risk_level(self, risk_score):
        """Get burnout risk level"""
        if risk_score < BurnoutRiskLevel.MODERATE.value[2] * 100:
            return {
                'label': BurnoutRiskLevel.LOW.value[0],
                'color': BurnoutRiskLevel.LOW.value[1],
            }
        elif risk_score < BurnoutRiskLevel.HIGH.value[2] * 100:
            return {
                'label': BurnoutRiskLevel.MODERATE.value[0],
                'color': BurnoutRiskLevel.MODERATE.value[1],
            }
        elif risk_score < BurnoutRiskLevel.CRITICAL.value[2] * 100:
            return {
                'label': BurnoutRiskLevel.HIGH.value[0],
                'color': BurnoutRiskLevel.HIGH.value[1],
            }
        else:
            return {
                'label': BurnoutRiskLevel.CRITICAL.value[0],
                'color': BurnoutRiskLevel.CRITICAL.value[1],
            }

    def predict_burnout_timeline(self, risk_score, degradation_rate=0.5):
        """Predict minutes until burnout"""
        if risk_score < 50:
            return None

        minutes_to_critical = max(1, (100 - risk_score) / degradation_rate)
        return min(60, max(2, int(round(minutes_to_critical))))

    def get_recommendations(self, risk_score, risk_factors):
        """Get personalized recommendations"""
        recommendations = []

        if risk_factors.get('blink_trend', 0) > 40:
            recommendations.append({
                'priority': 'high',
                'action': 'Take a 20-20-20 eye break',
                'reason': 'Your blink rate is declining significantly',
                'duration': 1,
            })

        if risk_factors.get('yawn_frequency', 0) > 50:
            recommendations.append({
                'priority': 'critical',
                'action': 'Take a 5-10 minute rest',
                'reason': 'High frequency of yawns detected',
                'duration': 5,
            })

        if risk_factors.get('focus_degradation', 0) > 30:
            recommendations.append({
                'priority': 'medium',
                'action': 'Try a quick meditation or breathing exercise',
                'reason': 'Your focus is gradually declining',
                'duration': 3,
            })

        if risk_factors.get('posture_decline', 0) > 30:
            recommendations.append({
                'priority': 'medium',
                'action': 'Perform posture-correcting exercises',
                'reason': 'Your posture has significantly declined',
                'duration': 5,
            })

        if risk_factors.get('session_duration', 0) > 70:
            recommendations.append({
                'priority': 'high',
                'action': 'Take a longer break or end session',
                'reason': 'You\'ve been working for an extended period',
                'duration': 15,
            })

        if risk_score > 70:
            recommendations.append({
                'priority': 'critical',
                'action': 'Take an extended break NOW',
                'reason': 'Burnout risk is critically high',
                'duration': 30,
            })

        return recommendations


def create_burnout_predictor():
    """Factory function"""
    return BurnoutPredictorService()
