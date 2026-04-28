// AI Coach Responses and Personality

export const AI_RESPONSES = {
  greeting: [
    "Hey there! Ready to have an amazing wellness session? 🌟",
    "Welcome back! Let's make today your best day yet! 💪",
    "Good to see you! Your wellness journey continues today. 🚀",
    "Time to take care of yourself! Let's get started. ✨",
  ],
  
  posture_correction: [
    "I noticed you're leaning forward. A quick stretch can help! 🧘",
    "Your posture looks a bit slouched. Let's straighten up! 📐",
    "Lean back a bit—your back will thank you. 💪",
    "I see some forward head posture. Try this neck stretch: 🧣",
  ],
  
  eye_fatigue: [
    "Your eyes might be getting tired. Let's follow the 20-20-20 rule! 👁️",
    "Time for an eye break! Look 20 feet away for 20 seconds. 🌳",
    "Your blink rate is low. Try the 20-20-20 eye exercise now. 💧",
    "Let your eyes rest for a moment. Look away from the screen! 📺",
  ],
  
  break_recommendation: [
    "You've been working hard! Time for a quick 5-minute break. ☕",
    "Your body needs a rest. Stand up and stretch! 🚶",
    "Let's take a breather. Step away for a moment. 🌬️",
    "You're doing great! Now let's recharge with a quick break. 🔋",
  ],
  
  exercise_motivation: [
    "Great posture! Keep it up! 🌟",
    "Excellent form on that exercise! 💪",
    "You're crushing it! Your dedication is amazing! 🔥",
    "Perfect alignment! That's what I'm talking about! ✨",
  ],
  
  focus_alert: [
    "Hey, I notice you're looking away. Let's refocus on the screen! 👀",
    "Your attention seems scattered. Let's bring focus back. 🎯",
    "I see you looking down. Let's get back on track! 📍",
    "Focus mode activated! Eyes on the screen please. 📺",
  ],
  
  yawn_detected: [
    "Looks like you're getting tired. Take a short break? 😴",
    "I sense some fatigue. A quick power nap or break might help. 💤",
    "You're looking sleepy. Let's recharge! ☕",
    "Fatigue detected. Maybe time for a coffee or water break? 💧",
  ],
  
  productivity_boost: [
    "Your productivity is at peak levels! Keep this momentum! 🚀",
    "Excellent session so far! You're in the zone! 🎯",
    "Your focus and posture are both perfect! 🌟",
    "This is your peak productivity window. Make the most of it! ⚡",
  ],
  
  wellness_milestone: [
    "Congratulations! You've reached a wellness milestone! 🏆",
    "Amazing! Your consistency is paying off! 🌈",
    "You've unlocked a new achievement! Keep going! 🎉",
    "This is incredible progress! You're a wellness champion! 👑",
  ],
  
  session_end: [
    "Great session today! You've earned your wellness points! 🎊",
    "Excellent work! Your body thanks you for this care. 🙏",
    "Session complete! You're on your way to better wellness! 🌟",
    "Amazing dedication today! See you next session! 👋",
  ],
};

export const AI_PERSONALITY_TRAITS = {
  tone: 'encouraging, friendly, professional',
  style: 'motivational yet practical',
  emoji_usage: 'moderate, contextual',
  response_length: 'concise but meaningful',
};

export const RECOMMENDATION_TRIGGERS = {
  posture_poor: {
    threshold: 60,
    frequency: 'every 3 minutes',
    priority: 'high',
  },
  blink_low: {
    threshold: 12,
    frequency: 'every 5 minutes',
    priority: 'medium',
  },
  focus_lost: {
    threshold: 50,
    frequency: 'immediate',
    priority: 'high',
  },
  fatigue_high: {
    threshold: 70,
    frequency: 'every 10 minutes',
    priority: 'critical',
  },
  session_long: {
    duration: 90,
    frequency: 'once',
    priority: 'medium',
  },
};

export default {
  AI_RESPONSES,
  AI_PERSONALITY_TRAITS,
  RECOMMENDATION_TRIGGERS,
};
