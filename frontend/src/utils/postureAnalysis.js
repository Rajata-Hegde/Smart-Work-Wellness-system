export const analyzePosture = (poseLandmarks) => {
  if (!poseLandmarks || poseLandmarks.length < 12) {
    return {
      label: 'Pose not detected',
      score: 0,
      color: 'gray',
      details: {},
    };
  }

  // MediaPipe pose indices
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_EAR = 7;
  const RIGHT_EAR = 8;
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const NOSE = 0;

  const leftShoulder = poseLandmarks[LEFT_SHOULDER];
  const rightShoulder = poseLandmarks[RIGHT_SHOULDER];
  const leftEar = poseLandmarks[LEFT_EAR];
  const rightEar = poseLandmarks[RIGHT_EAR];
  const leftHip = poseLandmarks[LEFT_HIP];
  const rightHip = poseLandmarks[RIGHT_HIP];
  const nose = poseLandmarks[NOSE];

  if (!leftShoulder.visibility || !rightShoulder.visibility || leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) {
    return {
      label: 'Pose not detected',
      score: 0,
      color: 'gray',
      details: {},
    };
  }

  let score = 100;
  const issues = [];
  const details = {};

  // Shoulder tilt angle (left vs right shoulder Y)
  const shoulderTiltDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const shoulderTiltThreshold = 0.05;
  const shoulderTiltDegrees = shoulderTiltDiff * 100;
  
  if (shoulderTiltDiff > shoulderTiltThreshold) {
    const isLeaningLeft = leftShoulder.y > rightShoulder.y;
    if (shoulderTiltDegrees > 15) {
      issues.push(isLeaningLeft ? 'Leaning left' : 'Leaning right');
      score -= 20;
    } else {
      score -= 10;
    }
  }
  details.shoulderTilt = shoulderTiltDegrees.toFixed(1);

  // Forward head detection (ear X position relative to shoulder)
  const headCenterX = (leftEar.x + rightEar.x) / 2;
  const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  const headForwardness = Math.abs(headCenterX - shoulderCenterX) * 100;

  if (headForwardness > 15) {
    issues.push('Forward head');
    score -= 20;
  }
  details.headForward = headForwardness.toFixed(1);

  // Slouching detection (shoulder Y vs hip Y comparison)
  const hipCenterY = (leftHip.y + rightHip.y) / 2;
  const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  const shoulderCenterXAdjusted = (leftShoulder.x + rightShoulder.x) / 2;

  // Z-axis depth check for slouching
  const shoulderBackness = Math.abs(leftShoulder.z + rightShoulder.z) / 2;
  const hipBackness = Math.abs(leftHip.z + rightHip.z) / 2;
  const depthDiff = shoulderBackness - hipBackness;

  if (shoulderCenterY > hipCenterY + 0.05) {
    issues.push('Slouching');
    score -= 25;
  }
  details.slouching = (shoulderCenterY - hipCenterY).toFixed(3);

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Determine primary issue and color
  let label = 'Good posture';
  let color = 'green';

  if (issues.length > 0) {
    label = issues[0];
    if (score >= 70) {
      color = 'yellow';
    } else if (score >= 40) {
      color = 'orange';
    } else {
      color = 'red';
    }
  } else if (score < 85) {
    color = 'yellow';
  }

  return {
    label,
    score: Math.round(score),
    color,
    details,
    issues,
  };
};

export const analyzeDistance = (faceLandmarks) => {
  if (!faceLandmarks || faceLandmarks.length < 400) {
    return {
      status: 'not-detected',
      message: 'Move closer to camera',
      distance: 0,
    };
  }

  // Left and right eye indices in MediaPipe face mesh
  const LEFT_EYE_OUTER = 33;
  const RIGHT_EYE_OUTER = 263;

  const leftEyeOuter = faceLandmarks[LEFT_EYE_OUTER];
  const rightEyeOuter = faceLandmarks[RIGHT_EYE_OUTER];

  if (!leftEyeOuter || !rightEyeOuter) {
    return {
      status: 'not-detected',
      message: 'Face not detected',
      distance: 0,
    };
  }

  // Calculate distance between eyes in pixels
  const eyeDistance = Math.sqrt(
    Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) +
    Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2)
  ) * 500; // Approximate scaling

  let status = 'ideal';
  let message = '📍 Ideal distance';

  if (eyeDistance < 60) {
    status = 'too-close';
    message = '👁️ Too close! Move back';
  } else if (eyeDistance > 120) {
    status = 'too-far';
    message = '👁️ Too far! Move closer';
  }

  return {
    status,
    message,
    distance: Math.round(eyeDistance),
  };
};
