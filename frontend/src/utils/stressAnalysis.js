/**
 * Stress Analysis Module
 * - Combines facial signals: jaw tension, brow furrow, eye squint
 * - Integrates typing rhythm variance
 * - Outputs weighted Stress Index (0-100)
 */

let stressHistory = [];
const PERSISTENCE_WINDOW = 90000; // 90 seconds for alert trigger

export const analyzeStress = (faceLandmarks, typingVariance = 0) => {
  if (!faceLandmarks || faceLandmarks.length < 468) return { stressIndex: 0, alert: false };

  // 1. Jaw Tension (Distance between mouth corners normalized by face width)
  const LEFT_MOUTH = 61;
  const RIGHT_MOUTH = 291;
  const JAW_LEFT = 172;
  const JAW_RIGHT = 397;
  
  const mouthWidth = Math.abs(faceLandmarks[LEFT_MOUTH].x - faceLandmarks[RIGHT_MOUTH].x);
  const jawWidth = Math.abs(faceLandmarks[JAW_LEFT].x - faceLandmarks[JAW_RIGHT].x);
  const jawTension = (mouthWidth / jawWidth) > 0.5 ? 25 : 0; // Simplified tension heuristic

  // 2. Brow Furrow (Distance between inner brows)
  const LEFT_BROW_INNER = 52;
  const RIGHT_BROW_INNER = 282;
  const browDistance = Math.abs(faceLandmarks[LEFT_BROW_INNER].x - faceLandmarks[RIGHT_BROW_INNER].x);
  const browFurrow = browDistance < 0.04 ? 30 : 0;

  // 3. Eye Squint (EAR-based squinting detection)
  // Reuse logic or simplify here
  const squinting = 0; // Placeholder for EAR-based squint analysis

  // 4. Typing Variance weight
  const typingStress = Math.min(30, typingVariance * 100);

  // Calculate Weighted Index
  const currentStress = Math.min(100, jawTension + browFurrow + typingStress);
  
  // Track persistence for alert
  const now = Date.now();
  stressHistory.push({ time: now, value: currentStress });
  stressHistory = stressHistory.filter(s => now - s.time < PERSISTENCE_WINDOW);

  const avgStress = stressHistory.reduce((a, b) => a + b.value, 0) / stressHistory.length;
  const shouldAlert = avgStress > 65 && stressHistory.length > 30; // Threshold 65 for 90s

  return {
    stressIndex: Math.round(avgStress),
    shouldAlert
  };
};
