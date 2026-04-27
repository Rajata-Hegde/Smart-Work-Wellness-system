const BLINK_THRESHOLD = 0.25;
const YAWN_THRESHOLD = 0.6;

export const calculateEAR = (eyeLandmarks) => {
  if (!eyeLandmarks || eyeLandmarks.length < 6) {
    return 0;
  }

  const p1 = eyeLandmarks[1]; // Eye upper 1
  const p2 = eyeLandmarks[2]; // Eye upper 2
  const p3 = eyeLandmarks[3]; // Eye upper 3
  const p4 = eyeLandmarks[4]; // Eye lower 1
  const p5 = eyeLandmarks[5]; // Eye lower 2
  const p6 = eyeLandmarks[6]; // Eye lower 3

  const dist1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
  const dist2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
  const dist3 = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

  return (dist1 + dist2) / (2.0 * dist3);
};

export const analyzeEyes = (faceLandmarks, sessionState) => {
  if (!faceLandmarks || faceLandmarks.length < 400) {
    return {
      blinkRate: 0,
      eyeFatigue: false,
      triggerBreak: false,
    };
  }

  const LEFT_EYE_START = 33;
  const RIGHT_EYE_START = 263;

  const leftEyeRegion = faceLandmarks.slice(LEFT_EYE_START, LEFT_EYE_START + 13);
  const rightEyeRegion = faceLandmarks.slice(RIGHT_EYE_START, RIGHT_EYE_START + 13);

  const leftEAR = calculateEAR(leftEyeRegion);
  const rightEAR = calculateEAR(rightEyeRegion);
  const avgEAR = (leftEAR + rightEAR) / 2;

  // Update session state with blink detection
  if (!sessionState.lastEAR) {
    sessionState.lastEAR = avgEAR;
    sessionState.blinkCount = 0;
    sessionState.framesSinceBlink = 0;
    sessionState.blinkTimestamps = [];
    sessionState.sessionStartTime = Date.now();
  }

  let blinkDetected = false;
  if (sessionState.lastEAR > BLINK_THRESHOLD && avgEAR <= BLINK_THRESHOLD) {
    blinkDetected = true;
    sessionState.blinkCount += 1;
    sessionState.blinkTimestamps.push(Date.now());
    sessionState.framesSinceBlink = 0;
  }

  sessionState.lastEAR = avgEAR;
  sessionState.framesSinceBlink += 1;

  // Calculate blink rate (blinks per minute over last 60 seconds)
  const now = Date.now();
  const sixtySecondsAgo = now - 60000;

  sessionState.blinkTimestamps = sessionState.blinkTimestamps.filter(
    (timestamp) => timestamp > sixtySecondsAgo
  );

  const blinkRate = sessionState.blinkTimestamps.length;

  // Normal blink rate is 15-20 per minute; fatigue if < 10
  const eyeFatigue = blinkRate < 10;

  // Calculate screen time
  const elapsedSeconds = (now - sessionState.sessionStartTime) / 1000;
  const triggerBreak = elapsedSeconds > 1200; // 20 minutes

  return {
    blinkRate,
    eyeFatigue,
    triggerBreak,
    avgEAR,
  };
};

export const detectYawn = (faceLandmarks, sessionState) => {
  if (!faceLandmarks || faceLandmarks.length < 400) {
    return {
      yawnDetected: false,
    };
  }

  // Mouth landmarks for MAR calculation
  const MOUTH_TOP = 13;
  const MOUTH_BOTTOM = 14;
  const MOUTH_LEFT = 78;
  const MOUTH_RIGHT = 308;

  const mouthTop = faceLandmarks[MOUTH_TOP];
  const mouthBottom = faceLandmarks[MOUTH_BOTTOM];
  const mouthLeft = faceLandmarks[MOUTH_LEFT];
  const mouthRight = faceLandmarks[MOUTH_RIGHT];

  if (!mouthTop || !mouthBottom || !mouthLeft || !mouthRight) {
    return { yawnDetected: false };
  }

  const verticalDist = Math.sqrt(
    Math.pow(mouthTop.x - mouthBottom.x, 2) +
    Math.pow(mouthTop.y - mouthBottom.y, 2)
  );

  const horizontalDist = Math.sqrt(
    Math.pow(mouthLeft.x - mouthRight.x, 2) +
    Math.pow(mouthLeft.y - mouthRight.y, 2)
  );

  const MAR = verticalDist / horizontalDist;

  if (!sessionState.yawnState) {
    sessionState.yawnState = {
      MAR: MAR,
      startTime: null,
      isYawning: false,
    };
  }

  const YAWN_THRESHOLD_VALUE = 0.6;

  if (MAR > YAWN_THRESHOLD_VALUE) {
    if (!sessionState.yawnState.isYawning) {
      sessionState.yawnState.isYawning = true;
      sessionState.yawnState.startTime = Date.now();
    } else {
      const yawnDuration = (Date.now() - sessionState.yawnState.startTime) / 1000;
      if (yawnDuration > 2) {
        return { yawnDetected: true };
      }
    }
  } else {
    sessionState.yawnState.isYawning = false;
    sessionState.yawnState.startTime = null;
  }

  sessionState.yawnState.MAR = MAR;

  return { yawnDetected: false };
};
