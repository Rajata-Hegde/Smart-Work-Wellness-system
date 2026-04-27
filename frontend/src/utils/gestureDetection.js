export const detectGesture = (leftHandLandmarks, rightHandLandmarks) => {
  if (!leftHandLandmarks && !rightHandLandmarks) {
    return null;
  }

  const hand = leftHandLandmarks || rightHandLandmarks;

  if (!hand || hand.length < 21) {
    return null;
  }

  // Hand landmark indices
  const THUMB_TIP = 4;
  const INDEX_TIP = 8;
  const MIDDLE_TIP = 12;
  const RING_TIP = 16;
  const PINKY_TIP = 20;

  const THUMB_MCP = 2;
  const INDEX_MCP = 5;
  const MIDDLE_MCP = 9;
  const RING_MCP = 13;
  const PINKY_MCP = 17;

  const THUMB_PIP = 3;
  const INDEX_PIP = 6;
  const MIDDLE_PIP = 10;
  const RING_PIP = 14;
  const PINKY_PIP = 18;

  const WRIST = 0;

  // Thumbs up detection
  const thumbTip = hand[THUMB_TIP];
  const indexTip = hand[INDEX_TIP];
  const middleTip = hand[MIDDLE_TIP];
  const ringTip = hand[RING_TIP];
  const pinkyTip = hand[PINKY_TIP];

  const thumbUp =
    thumbTip.y < indexTip.y &&
    thumbTip.y < middleTip.y &&
    thumbTip.y < ringTip.y &&
    thumbTip.y < pinkyTip.y &&
    thumbTip.visibility > 0.7;

  if (thumbUp) {
    return 'markDone';
  }

  // Open palm detection (all fingers extended above MCP)
  const indexMcp = hand[INDEX_MCP];
  const middleMcp = hand[MIDDLE_MCP];
  const ringMcp = hand[RING_MCP];
  const pinkyMcp = hand[PINKY_MCP];

  const openPalm =
    indexTip.y < indexMcp.y &&
    middleTip.y < middleMcp.y &&
    ringTip.y < ringMcp.y &&
    pinkyTip.y < pinkyMcp.y &&
    indexTip.visibility > 0.7 &&
    middleTip.visibility > 0.7 &&
    ringTip.visibility > 0.7 &&
    pinkyTip.visibility > 0.7;

  if (openPalm) {
    return 'snoozeAlert';
  }

  // Fist detection (all fingertips curled below PIP)
  const indexPip = hand[INDEX_PIP];
  const middlePip = hand[MIDDLE_PIP];
  const ringPip = hand[RING_PIP];
  const pinkyPip = hand[PINKY_PIP];

  const fist =
    indexTip.y > indexPip.y &&
    middleTip.y > middlePip.y &&
    ringTip.y > ringPip.y &&
    pinkyTip.y > pinkyPip.y;

  if (fist) {
    return 'dismiss';
  }

  return null;
};
