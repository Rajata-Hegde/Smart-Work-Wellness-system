export const analyzeAttention = (faceLandmarks, sessionState) => {
  if (!faceLandmarks || faceLandmarks.length < 400) {
    return {
      lookingAway: false,
      idle: false,
      focusScore: 100,
    };
  }

  const NOSE = 1;
  const LEFT_EAR_X = 123;
  const RIGHT_EAR_X = 352;

  const nose = faceLandmarks[NOSE];
  const leftEar = faceLandmarks[LEFT_EAR_X];
  const rightEar = faceLandmarks[RIGHT_EAR_X];

  if (!nose || !leftEar || !rightEar) {
    return {
      lookingAway: false,
      idle: false,
      focusScore: 100,
    };
  }

  if (!sessionState.attention) {
    sessionState.attention = {
      focusScore: 100,
      lookingAwayStartTime: null,
      lastFaceDetectedTime: Date.now(),
      idleStartTime: null,
      lookingAwayEvents: 0,
      idleEvents: 0,
    };
  }

  const now = Date.now();

  // Calculate face yaw (nose position relative to ear midpoint)
  const earMidX = (leftEar.x + rightEar.x) / 2;
  const yawAngle = Math.abs(nose.x - earMidX) * 100; // Simplified yaw calculation

  let lookingAway = false;
  let idle = false;

  // Looking away detection
  if (yawAngle > 30) {
    if (!sessionState.attention.lookingAwayStartTime) {
      sessionState.attention.lookingAwayStartTime = now;
    } else {
      const lookingAwayDuration = (now - sessionState.attention.lookingAwayStartTime) / 1000;
      if (lookingAwayDuration > 5) {
        lookingAway = true;

        if (!sessionState.attention.lookingAwayReported) {
          sessionState.attention.focusScore = Math.max(0, sessionState.attention.focusScore - 5);
          sessionState.attention.lookingAwayEvents += 1;
          sessionState.attention.lookingAwayReported = true;
        }
      }
    }
  } else {
    sessionState.attention.lookingAwayStartTime = null;
    sessionState.attention.lookingAwayReported = false;
  }

  // Face detection tracking for idle detection
  sessionState.attention.lastFaceDetectedTime = now;

  // Idle detection (no face detected for 10+ seconds)
  if (!sessionState.attention.idleStartTime) {
    sessionState.attention.idleStartTime = now;
  } else {
    const idleDuration = (now - sessionState.attention.idleStartTime) / 1000;
    if (idleDuration > 10) {
      idle = true;

      if (!sessionState.attention.idleReported) {
        sessionState.attention.focusScore = Math.max(0, sessionState.attention.focusScore - 10);
        sessionState.attention.idleEvents += 1;
        sessionState.attention.idleReported = true;
      }
    }
  }

  // Reset idle if face is detected
  if (nose.visibility > 0.5) {
    sessionState.attention.idleStartTime = now;
    sessionState.attention.idleReported = false;
  }

  return {
    lookingAway,
    idle,
    focusScore: Math.max(0, Math.min(100, sessionState.attention.focusScore)),
  };
};
