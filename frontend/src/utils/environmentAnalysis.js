/**
 * Ambient Environment Monitor
 * - Measures average frame brightness
 * - Detects lighting flicker
 * - Inferred from webcam feed
 */

let brightnessHistory = [];

export const analyzeEnvironment = (videoElement) => {
  if (!videoElement) return { score: 100, issue: null };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  
  ctx.drawImage(videoElement, 0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const brightness = (data[0] + data[1] + data[2]) / 3;

  // Flicker detection
  brightnessHistory.push({ time: Date.now(), value: brightness });
  if (brightnessHistory.length > 30) brightnessHistory.shift();

  let flickerRate = 0;
  if (brightnessHistory.length > 2) {
    const last = brightnessHistory[brightnessHistory.length - 1].value;
    const prev = brightnessHistory[brightnessHistory.length - 2].value;
    flickerRate = Math.abs(last - prev);
  }

  let score = 100;
  let issue = null;

  if (brightness < 40) {
    score -= 30;
    issue = 'Environment too dark';
  } else if (brightness > 220) {
    score -= 30;
    issue = 'Possible glare detected';
  }

  if (flickerRate > 20) {
    score -= 40;
    issue = 'Lighting flicker detected';
  }

  // Time of day check
  const hour = new Date().getHours();
  if (hour > 19 || hour < 6) {
    issue = issue || 'Blue light warning (Late hour)';
  }

  return {
    score: Math.max(0, score),
    brightness: Math.round((brightness / 255) * 100),
    issue
  };
};
