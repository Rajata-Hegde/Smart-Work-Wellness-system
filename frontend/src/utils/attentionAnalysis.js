/**
 * Advanced Attention & Gaze Analysis
 * - Quadrant-based gaze mapping (9 zones)
 * - Head bobbing detection (Drowsiness)
 * - Center zone persistence
 */

let verticalHeadHistory = [];

export const analyzeAttention = (faceLandmarks) => {
  if (!faceLandmarks || faceLandmarks.length < 468) return { focusScore: 0, status: 'No Face Detected', quadrant: 4 };

  const NOSE = 1;
  const LEFT_EYE_INNER = 133;
  const RIGHT_EYE_INNER = 362;
  
  const nose = faceLandmarks[NOSE];
  
  // 1. Quadrant Mapping (Simplified Gaze via Head Orientation)
  // Divide 0-1 range into 3x3 grid
  const col = nose.x < 0.33 ? 0 : nose.x < 0.66 ? 1 : 2;
  const row = nose.y < 0.33 ? 0 : nose.y < 0.66 ? 1 : 2;
  const quadrant = row * 3 + col; // 0-8

  // 2. Head Bobbing Detection
  verticalHeadHistory.push(nose.y);
  if (verticalHeadHistory.length > 60) verticalHeadHistory.shift();

  let isBobbing = false;
  if (verticalHeadHistory.length > 30) {
    const range = Math.max(...verticalHeadHistory) - Math.min(...verticalHeadHistory);
    // 0.05 normalized height is approx 15-20px on 720p
    if (range > 0.08) isBobbing = true; 
  }

  // 3. Focus Scoring
  let focusScore = 100;
  let status = 'Focused';

  // If looking at extreme edges (quadrants 0, 2, 6, 8)
  if ([0, 2, 6, 8].includes(quadrant)) {
    focusScore -= 30;
    status = 'Edge Gazing';
  }

  if (isBobbing) {
    focusScore -= 50;
    status = 'Drowsy / Bobbing';
  }

  // Yaw/Pitch for "Looking Away"
  const eyeCenter = (faceLandmarks[LEFT_EYE_INNER].x + faceLandmarks[RIGHT_EYE_INNER].x) / 2;
  const yaw = Math.abs(nose.x - eyeCenter);
  if (yaw > 0.05) {
    focusScore -= 40;
    status = 'Looking Away';
  }

  return {
    focusScore: Math.max(0, focusScore),
    status,
    quadrant,
    isBobbing
  };
};
