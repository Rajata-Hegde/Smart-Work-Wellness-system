import { useState, useEffect, useRef } from 'react';
import './App.css';
import Webcam from './components/Webcam';
import PostureDisplay from './components/PostureDisplay';
import FatigueAlert from './components/FatigueAlert';
import ExerciseCoach from './components/ExerciseCoach';
import WellnessDashboard from './components/WellnessDashboard';
import { analyzePosture } from './utils/postureAnalysis';
import { detectGesture } from './utils/gestureDetection';

function App() {
  const [landmarkResults, setLandmarkResults] = useState({
    pose: null,
    face: null,
    leftHand: null,
    rightHand: null,
  });

  const [postureTrigger, setPostureTrigger] = useState(null);
  const [alertSnoozedUntil, setAlertSnoozedUntil] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const postureStateRef = useRef({
    lastLabel: null,
    issueStartTime: null,
  });
  const gestureStateRef = useRef({
    lastGesture: null,
    gestureStartTime: null,
  });

  const handleWebcamResults = (results) => {
    setLandmarkResults(results);

    // Track posture issues for exercise coach
    if (results.pose) {
      const postureAnalysis = analyzePosture(results.pose);
      const currentLabel = postureAnalysis.label;

      if (currentLabel !== 'Good posture' && currentLabel !== 'Pose not detected') {
        if (postureStateRef.current.lastLabel === currentLabel) {
          const duration = (Date.now() - postureStateRef.current.issueStartTime) / 1000;
          if (duration > 5) {
            setPostureTrigger(currentLabel);
          }
        } else {
          postureStateRef.current.lastLabel = currentLabel;
          postureStateRef.current.issueStartTime = Date.now();
        }
      } else {
        postureStateRef.current.lastLabel = null;
        postureStateRef.current.issueStartTime = null;
        setPostureTrigger(null);
      }
    }

    // Detect gestures
    const gesture = detectGesture(results.leftHand, results.rightHand);

    if (gesture) {
      if (gestureStateRef.current.lastGesture === gesture) {
        const duration = (Date.now() - gestureStateRef.current.gestureStartTime) / 1000;
        if (duration > 1) {
          handleGesture(gesture);
          gestureStateRef.current.lastGesture = null;
        }
      } else {
        gestureStateRef.current.lastGesture = gesture;
        gestureStateRef.current.gestureStartTime = Date.now();
      }
    } else {
      gestureStateRef.current.lastGesture = null;
      gestureStateRef.current.gestureStartTime = null;
    }
  };

  const handleGesture = (gesture) => {
    if (gesture === 'markDone') {
      if (postureTrigger) {
        setCompletedExercises((prev) => [...prev, postureTrigger]);
        setPostureTrigger(null);
        speakFeedback('Exercise marked as done');
      }
    } else if (gesture === 'snoozeAlert') {
      setAlertSnoozedUntil(Date.now() + 5 * 60 * 1000);
      speakFeedback('Alerts snoozed for 5 minutes');
    } else if (gesture === 'dismiss') {
      setPostureTrigger(null);
      speakFeedback('Alert dismissed');
    }
  };

  const speakFeedback = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExerciseComplete = (exerciseName) => {
    setCompletedExercises((prev) => [...prev, exerciseName]);
    setPostureTrigger(null);
  };

  useEffect(() => {
    if (!alertSnoozedUntil) return;

    const timeout = setTimeout(() => {
      if (Date.now() >= alertSnoozedUntil) {
        setAlertSnoozedUntil(null);
      }
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [alertSnoozedUntil]);

  const shouldShowAlerts = !alertSnoozedUntil || Date.now() > alertSnoozedUntil;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏥 SMART HEALTH</h1>
        <p>Real-time posture & wellness monitor</p>
      </header>

      <main className="app-main">
        <div className="webcam-section">
          <Webcam onResults={handleWebcamResults} />
        </div>

        <div className="feedback-section">
          <PostureDisplay 
            poseLandmarks={landmarkResults.pose}
            faceLandmarks={landmarkResults.face}
          />
          {shouldShowAlerts && (
            <FatigueAlert 
              faceLandmarks={landmarkResults.face}
              poseLandmarks={landmarkResults.pose}
            />
          )}
        </div>
      </main>

      <ExerciseCoach
        postureLabelTrigger={postureTrigger}
        poseLandmarks={landmarkResults.pose}
        faceLandmarks={landmarkResults.face}
        onComplete={handleExerciseComplete}
      />

      <WellnessDashboard
        poseLandmarks={landmarkResults.pose}
        faceLandmarks={landmarkResults.face}
      />
    </div>
  );
}

export default App;