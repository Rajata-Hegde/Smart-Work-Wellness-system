"""
AI Coach Service
Personalized recommendations and natural language responses
"""

import random
from enum import Enum


class RecommendationType(Enum):
    POSTURE = "posture"
    EYES = "eyes"
    FOCUS = "focus"
    FATIGUE = "fatigue"
    EXERCISE = "exercise"
    BREAK = "break"


class AICoachService:
    """AI Coach for personalized wellness recommendations"""

    GREETINGS = [
        "Hey there! Ready to have an amazing wellness session? 🌟",
        "Welcome back! Let's make today your best day yet! 💪",
        "Good to see you! Your wellness journey continues today. 🚀",
        "Time to take care of yourself! Let's get started. ✨",
    ]

    POSTURE_TIPS = [
        "I noticed you're leaning forward. A quick stretch can help! 🧘",
        "Your posture looks a bit slouched. Let's straighten up! 📐",
        "Lean back a bit—your back will thank you. 💪",
        "I see some forward head posture. Try this neck stretch: 🧣",
    ]

    EYE_TIPS = [
        "Your eyes might be getting tired. Let's follow the 20-20-20 rule! 👁️",
        "Time for an eye break! Look 20 feet away for 20 seconds. 🌳",
        "Your blink rate is low. Try the 20-20-20 eye exercise now. 💧",
        "Let your eyes rest for a moment. Look away from the screen! 📺",
    ]

    BREAK_TIPS = [
        "You've been working hard! Time for a quick 5-minute break. ☕",
        "Your body needs a rest. Stand up and stretch! 🚶",
        "Let's take a breather. Step away for a moment. 🌬️",
        "You're doing great! Now let's recharge with a quick break. 🔋",
    ]

    def __init__(self):
        self.user_profile = {}
        self.recommendation_cooldowns = {}

    def initialize_user(self, user_data):
        """Initialize user profile"""
        self.user_profile = user_data

    def get_greeting(self):
        """Get random greeting message"""
        return random.choice(self.GREETINGS)

    def get_contextual_response(self, metrics):
        """Get response based on current metrics"""
        posture_score = metrics.get('postureScore', 0)
        focus_score = metrics.get('focusScore', 0)
        fatigue_score = metrics.get('fatigueScore', 0)
        eye_health = metrics.get('eyeHealthScore', 0)

        if fatigue_score > 70:
            return random.choice(self.BREAK_TIPS)
        elif posture_score < 60:
            return random.choice(self.POSTURE_TIPS)
        elif focus_score < 50:
            return "Let's refocus. Look at the screen and take a deep breath. 🎯"
        elif eye_health < 60:
            return random.choice(self.EYE_TIPS)

        return None

    def generate_recommendations(self, metrics):
        """Generate personalized recommendations"""
        recommendations = []

        if metrics.get('postureScore', 100) < 60:
            recommendations.append({
                'type': RecommendationType.POSTURE.value,
                'message': random.choice(self.POSTURE_TIPS),
                'priority': 'high',
                'action': 'exercise',
            })

        if metrics.get('eyeHealthScore', 100) < 60:
            recommendations.append({
                'type': RecommendationType.EYES.value,
                'message': random.choice(self.EYE_TIPS),
                'priority': 'medium',
                'action': 'break',
                'duration': 1,
            })

        if metrics.get('focusScore', 100) < 50:
            recommendations.append({
                'type': RecommendationType.FOCUS.value,
                'message': "Let's get back on track. Focus on the screen. 🎯",
                'priority': 'high',
                'action': 'refocus',
            })

        if metrics.get('fatigueScore', 0) > 70:
            recommendations.append({
                'type': RecommendationType.FATIGUE.value,
                'message': random.choice(self.BREAK_TIPS),
                'priority': 'critical',
                'action': 'break',
                'duration': 5,
            })

        return recommendations

    def get_encouragement(self):
        """Get encouragement message"""
        messages = [
            "Great form! ✨",
            "You're crushing it! 💪",
            "Perfect alignment! 🌟",
            "Excellent work! 🚀",
        ]
        return random.choice(messages)

    def get_session_end_message(self):
        """Get session end message"""
        messages = [
            "Great session today! You've earned your wellness points! 🎊",
            "Excellent work! Your body thanks you for this care. 🙏",
            "Session complete! You're on your way to better wellness! 🌟",
            "Amazing dedication today! See you next session! 👋",
        ]
        return random.choice(messages)


def create_ai_coach_service():
    """Factory function"""
    return AICoachService()
