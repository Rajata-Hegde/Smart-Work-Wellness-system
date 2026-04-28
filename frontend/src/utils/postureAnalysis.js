/**
 * Full Biomechanical Posture Analysis v3.0
 * - Metric 1: Forward Head (Ear vs Shoulder)
 * - Metric 2: Spinal Alignment (Nose-Shoulder-Hip Angle)
 * - Metric 3: Shoulder Symmetry (Y delta)
 * - Metric 4: Head Tilt (Ear Y delta)
 * - Metric 5: Hip Slide Detection (Y drift)
 * - Metric 6: Wrist Deviation (if hands visible)
 */

let previousLandmarks = null;
const SMOOTHING_FACTOR = 0.2;

let hipSlideHistory = []; // { time, y }
let historicalScores = [];

export const analyzePosture = (rawLandmarks) => {
  if (!rawLandmarks || rawLandmarks.length < 25) return { 
    label: 'Initializing...', 
    score: 0, 
    metrics: {}, 
    isHorizontal: false 
  };

  // Smoothing
  const landmarks = rawLandmarks.map((point, i) => {
    if (!previousLandmarks) return point;
    return {
      x: point.x * SMOOTHING_FACTOR + previousLandmarks[i].x * (1 - SMOOTHING_FACTOR),
      y: point.y * SMOOTHING_FACTOR + previousLandmarks[i].y * (1 - SMOOTHING_FACTOR),
      z: point.z * SMOOTHING_FACTOR + previousLandmarks[i].z * (1 - SMOOTHING_FACTOR),
      visibility: point.visibility
    };
  });
  previousLandmarks = landmarks;

  const n = landmarks[0];
  const le = landmarks[7];
  const re = landmarks[8];
  const ls = landmarks[11];
  const rs = landmarks[12];
  const lh = landmarks[23];
  const rh = landmarks[24];
  const lw = landmarks[15];
  const rw = landmarks[16];
  const lelb = landmarks[13];
  const relb = landmarks[14];

  // 0. Horizontal Check
  const hipMidY = (lh.y + rh.y) / 2;
  if (Math.abs(n.y - hipMidY) < 0.15) {
    return { label: "Lying down", score: 0, isHorizontal: true, metrics: {} };
  }

  // Helper: Distance
  const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  // --- METRIC 1: Forward Head Score ---
  const earMid = { x: (le.x + re.x) / 2, y: (le.y + re.y) / 2 };
  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const headSize = dist(le, re) || 0.1;
  const forwardHeadDist = Math.abs(earMid.x - shoulderMid.x);
  const forwardHeadRatio = (forwardHeadDist / headSize) * 100;
  let m1 = 100 - Math.min(100, (forwardHeadRatio / 15) * 100); // 15% head size is severe

  // --- METRIC 2: Spinal Alignment ---
  const hipMidX = (lh.x + rh.x) / 2;
  const angle = Math.abs(Math.atan2(hipMidX - shoulderMid.x, hipMidY - shoulderMid.y) * 180 / Math.PI);
  let m2 = 100 - Math.min(100, (angle / 15) * 100); // 15 degrees is severe

  // --- METRIC 3: Shoulder Symmetry ---
  const shoulderWidth = dist(ls, rs) || 0.3;
  const shoulderYDiff = Math.abs(ls.y - rs.y);
  const shoulderSymRatio = (shoulderYDiff / shoulderWidth) * 100;
  let m3 = 100 - Math.min(100, (shoulderSymRatio / 8) * 100); // 8% is severe

  // --- METRIC 4: Head Tilt ---
  const headTiltPx = Math.abs(le.y - re.y) * 1000; // Normalized to ~1000px height
  let m4 = 100 - Math.min(100, (headTiltPx / 20) * 100); // 20px is severe

  // --- METRIC 5: Hip Slide ---
  const now = Date.now();
  hipSlideHistory.push({ time: now, y: hipMidY });
  const tenMinsAgo = now - 600000;
  hipSlideHistory = hipSlideHistory.filter(h => h.time > tenMinsAgo);
  
  let m5 = 100;
  if (hipSlideHistory.length > 2) {
    const drift = hipMidY - hipSlideHistory[0].y;
    // 0.04 normalized is approx 40px
    m5 = 100 - Math.min(100, (Math.max(0, drift) / 0.04) * 100);
  }

  // --- METRIC 6: Wrist Deviation ---
  let m6 = 100;
  if (lw.visibility > 0.5 && rw.visibility > 0.5) {
    const lAngle = Math.abs(Math.atan2(lw.y - lelb.y, lw.x - lelb.x) * 180 / Math.PI);
    const rAngle = Math.abs(Math.atan2(rw.y - relb.y, rw.x - relb.x) * 180 / Math.PI);
    const maxDev = Math.max(lAngle, rAngle);
    if (maxDev > 20) m6 = 80; // Simple penalty
  }

  // COMPOSITE SCORE
  const composite = Math.round(
    (m1 * 0.35) + 
    (m2 * 0.30) + 
    (m3 * 0.15) + 
    (m4 * 0.10) + 
    (m5 * 0.10)
  );

  // Labels
  let label = 'Excellent';
  if (composite < 50) label = 'Severe Slouch';
  else if (m1 < 50) label = 'Forward Head';
  else if (m5 < 50) label = 'Sliding Off Chair';
  else if (composite < 80) label = 'Good';

  return {
    label,
    score: composite,
    metrics: {
      forwardHead: Math.round(m1),
      alignment: Math.round(m2),
      symmetry: Math.round(m3),
      headTilt: Math.round(m4),
      hipSlide: Math.round(m5),
      wrist: Math.round(m6)
    },
    isHorizontal: false
  };
};

export const startCalibration = () => {
  previousLandmarks = null;
  hipSlideHistory = [];
};

export const processCalibrationFrame = (landmarks) => {
  // Simple 3s wait handled by App.jsx, but we could store baseline here
  return true; // Calibration done
};
