export const exerciseMap = {
  Slouching: {
    name: 'Chest Opener',
    instruction:
      'Clasp your hands behind your back and gently push your chest forward. Keep your shoulders back and feel the stretch across your chest.',
    targetAngles: { shoulderBack: 15 },
    holdSeconds: 5,
  },
  'Forward head': {
    name: 'Chin Tuck',
    instruction:
      'Pull your chin straight back, as if making a double chin. Keep your eyes level and hold the position.',
    targetAngles: { neckTilt: 5 },
    holdSeconds: 5,
  },
  'Leaning left': {
    name: 'Right Neck Stretch',
    instruction:
      'Tilt your head to the right slowly. Feel the stretch on the left side of your neck.',
    targetAngles: { neckTilt: 30 },
    holdSeconds: 5,
  },
  'Leaning right': {
    name: 'Left Neck Stretch',
    instruction:
      'Tilt your head to the left slowly. Feel the stretch on the right side of your neck.',
    targetAngles: { neckTilt: -30 },
    holdSeconds: 5,
  },
  'Eye fatigue': {
    name: 'Palming',
    instruction:
      'Cover your eyes with your warm palms. Relax and breathe deeply. Block out all light.',
    holdSeconds: 20,
  },
};

export const validateExerciseForm = (poseLandmarks, faceLandmarks, exercise) => {
  if (!poseLandmarks || !faceLandmarks) {
    return {
      feedback: 'Pose not detected',
      isValid: false,
    };
  }

  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_EAR = 7;
  const RIGHT_EAR = 8;

  const leftShoulder = poseLandmarks[LEFT_SHOULDER];
  const rightShoulder = poseLandmarks[RIGHT_SHOULDER];
  const leftEar = faceLandmarks[7]; // Approximate ear position
  const rightEar = faceLandmarks[8];

  switch (exercise.name) {
    case 'Chin Tuck': {
      // Check that head is pulled back (ear X should be further back than shoulder X)
      const headCenterX = (leftEar.x + rightEar.x) / 2;
      const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
      const pullBack = (shoulderCenterX - headCenterX) * 100;

      if (pullBack < 5) {
        return { feedback: 'Pull your chin back more', isValid: false };
      } else if (pullBack > 25) {
        return { feedback: 'Relax, not too far back', isValid: false };
      } else {
        return { feedback: 'Good form ✅', isValid: true };
      }
    }

    case 'Right Neck Stretch': {
      // Check that right ear is below left ear
      const earHeightDiff = (leftEar.y - rightEar.y) * 100;

      if (earHeightDiff < 15) {
        return { feedback: 'Tilt further to the right', isValid: false };
      } else if (earHeightDiff > 40) {
        return { feedback: 'Reduce the tilt slightly', isValid: false };
      } else {
        return { feedback: 'Good form ✅', isValid: true };
      }
    }

    case 'Left Neck Stretch': {
      // Check that left ear is below right ear
      const earHeightDiff = (rightEar.y - leftEar.y) * 100;

      if (earHeightDiff < 15) {
        return { feedback: 'Tilt further to the left', isValid: false };
      } else if (earHeightDiff > 40) {
        return { feedback: 'Reduce the tilt slightly', isValid: false };
      } else {
        return { feedback: 'Good form ✅', isValid: true };
      }
    }

    case 'Chest Opener': {
      // Check shoulder depth (Z-axis)
      const shoulderDepth = Math.abs(leftShoulder.z + rightShoulder.z) / 2;

      if (shoulderDepth > 0.2) {
        return { feedback: 'Push your chest forward more', isValid: false };
      } else if (shoulderDepth < 0.05) {
        return { feedback: 'Hold steady', isValid: true };
      } else {
        return { feedback: 'Good form ✅', isValid: true };
      }
    }

    case 'Palming': {
      // For palming, just check that face is visible
      return { feedback: 'Hold for the full duration', isValid: true };
    }

    default: {
      return { feedback: 'Hold steady', isValid: true };
    }
  }
};
