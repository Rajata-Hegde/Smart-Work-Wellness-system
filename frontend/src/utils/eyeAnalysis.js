/**
 * Advanced Eye & Fatigue Analysis
 * - Dynamic EAR Baseline (First 60s)
 * - Microsleep Detection (800ms threshold)
 * - Blink Frequency Trend (Blinks per minute)
 */

let earHistory = [];
let blinkHistory = []; // { timestamp }
let closedStart = null;
let earBaseline = 0.25; // Default fallback
let isBaselining = true;
let baseliningStart = Date.now();

export const analyzeEyes = (faceLandmarks) => {
  if (!faceLandmarks || faceLandmarks.length < 468) return { fatigueScore: 100, blinkRate: 0, microsleep: false };

  const LEFT_EYE = [33, 160, 158, 133, 153, 144];
  const RIGHT_EYE = [362, 385, 387, 263, 373, 380];

  const getEAR = (eyeIndices) => {
    const p = eyeIndices.map(i => faceLandmarks[i]);
    const v1 = Math.sqrt(Math.pow(p[1].x - p[5].x, 2) + Math.pow(p[1].y - p[5].y, 2));
    const v2 = Math.sqrt(Math.pow(p[2].x - p[4].x, 2) + Math.pow(p[2].y - p[4].y, 2));
    const h = Math.sqrt(Math.pow(p[0].x - p[3].x, 2) + Math.pow(p[0].y - p[3].y, 2));
    return (v1 + v2) / (2.0 * h);
  };

  const ear = (getEAR(LEFT_EYE) + getEAR(RIGHT_EYE)) / 2;
  
  // Dynamic Baselining (First 60 seconds)
  if (isBaselining) {
    earHistory.push(ear);
    if (Date.now() - baseliningStart > 60000) {
      isBaselining = false;
      const sorted = [...earHistory].sort((a, b) => a - b);
      earBaseline = sorted[Math.floor(sorted.length * 0.8)]; // Use 80th percentile as open baseline
      console.log("EAR Baseline Calibrated:", earBaseline);
    }
  }

  // Blink Detection & Microsleep
  const threshold = earBaseline * 0.65;
  let isClosed = ear < threshold;
  let microsleep = false;

  if (isClosed) {
    if (!closedStart) closedStart = Date.now();
    const closedDuration = Date.now() - closedStart;
    if (closedDuration > 800) microsleep = true;
  } else {
    if (closedStart && (Date.now() - closedStart) > 50 && (Date.now() - closedStart) < 400) {
      blinkHistory.push(Date.now());
    }
    closedStart = null;
  }

  // Blink Frequency (Last 5 minutes)
  const fiveMinsAgo = Date.now() - 300000;
  blinkHistory = blinkHistory.filter(t => t > fiveMinsAgo);
  const blinkRate = Math.round(blinkHistory.length / 5); // BPM

  // Fatigue Score calculation
  let fatigueScore = 100;
  if (blinkRate < 8) fatigueScore -= 30; // Eye strain indicator
  if (microsleep) fatigueScore = 0;
  else if (isClosed) fatigueScore -= 10;

  return {
    fatigueScore: Math.max(0, fatigueScore),
    blinkRate,
    microsleep,
    isBaselining
  };
};

export const detectYawn = (faceLandmarks) => {
  if (!faceLandmarks) return false;
  const TOP_LIP = 13;
  const BOTTOM_LIP = 14;
  const dist = Math.abs(faceLandmarks[TOP_LIP].y - faceLandmarks[BOTTOM_LIP].y);
  return dist > 0.05;
};
