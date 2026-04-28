/**
 * Focus Flow Detector
 * - Fuses gaze, typing cadence, posture stability, and blink rate
 * - Implements 5-minute requirement for "Deep Work"
 */

let flowStartTime = null;
let lastCheck = Date.now();
const FLOW_WINDOW = 300000; // 5 minutes

export const analyzeFlow = (metrics) => {
  const { gazeQuadrant, typingVariance, postureScore, blinkRate } = metrics;

  // Criteria:
  // - Gaze in center 3 zones (3, 4, 5)
  // - Typing variance < 20%
  // - Posture > 80
  // - Blink rate 8-25
  const isCurrentlyInFlowZone = 
    [3, 4, 5].includes(gazeQuadrant) &&
    typingVariance < 0.2 &&
    postureScore > 80 &&
    blinkRate >= 8 && blinkRate <= 25;

  const now = Date.now();
  
  if (isCurrentlyInFlowZone) {
    if (!flowStartTime) flowStartTime = now;
  } else {
    // Grace period of 30s for flow breaks
    if (flowStartTime && (now - lastCheck) > 30000) {
      flowStartTime = null;
    }
  }

  if (isCurrentlyInFlowZone) lastCheck = now;

  const isInFlow = flowStartTime && (now - flowStartTime) >= FLOW_WINDOW;
  const duration = isInFlow ? Math.round((now - flowStartTime) / 1000) : 0;

  return {
    isInFlow: !!isInFlow,
    duration,
    progress: flowStartTime ? Math.min(100, ((now - flowStartTime) / FLOW_WINDOW) * 100) : 0
  };
};

export const getBodyLanguageState = (postureScore, stressIndex, typingVariance) => {
  const isPostureBad = postureScore < 70;
  const isStressHigh = stressIndex > 65;
  const isTypingErratic = typingVariance > 0.4;
  const isTypingSlow = typingVariance > 0 && typingVariance < 0.1;

  if (isPostureBad && isStressHigh && isTypingErratic) return "Overwhelmed";
  if (isPostureBad && !isStressHigh && isTypingSlow) return "Fatigued";
  if (!isPostureBad && isStressHigh && !isTypingErratic) return "Hyperfocused";
  if (isPostureBad && isStressHigh && typingVariance === 0) return "Disengaged / Burnout Risk";
  
  return "Flow State";
};
