import { useState, useEffect, useRef } from 'react';
import { exerciseMap, validateExerciseForm } from '../utils/exerciseCoach';

const ExerciseCoach = ({ postureLabelTrigger, poseLandmarks, faceLandmarks, onComplete }) => {
  const [activeExercise, setActiveExercise] = useState(null);
  const [holdCount, setHoldCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const feedbackRefRef = useRef({});

  useEffect(() => {
    if (!postureLabelTrigger) {
      setActiveExercise(null);
      setHoldCount(0);
      feedbackRefRef.current = {};
      return;
    }

    const exercise = exerciseMap[postureLabelTrigger];
    if (!exercise) return;

    if (!activeExercise || activeExercise.name !== exercise.name) {
      setActiveExercise(exercise);
      setHoldCount(0);
      feedbackRefRef.current = {};
    }
  }, [postureLabelTrigger, activeExercise]);

  useEffect(() => {
    if (!activeExercise || !poseLandmarks || !faceLandmarks) return;

    const validation = validateExerciseForm(poseLandmarks, faceLandmarks, activeExercise);
    setFeedback(validation.feedback);
    setIsFormValid(validation.isValid);

    // Provide voice feedback on corrections
    if (
      validation.feedback !== 'Good form ✅' &&
      validation.feedback !== 'Hold steady' &&
      validation.feedback !== feedbackRefRef.current.lastFeedback
    ) {
      speakFeedback(validation.feedback);
      feedbackRefRef.current.lastFeedback = validation.feedback;
    }

    if (validation.isValid) {
      setHoldCount((prev) => prev + 1);

      if (holdCount > 0 && holdCount % 30 === 0) {
        const secondsHeld = Math.floor(holdCount / 30);
        if (
          secondsHeld === activeExercise.holdSeconds &&
          !feedbackRefRef.current.completionAnnounced
        ) {
          speakFeedback('Good job! Exercise complete');
          feedbackRefRef.current.completionAnnounced = true;

          if (onComplete) {
            onComplete(activeExercise.name);
          }

          setTimeout(() => {
            setActiveExercise(null);
            setHoldCount(0);
            feedbackRefRef.current = {};
          }, 2000);
        }
      }
    } else {
      setHoldCount(0);
    }
  }, [poseLandmarks, faceLandmarks, activeExercise, holdCount, onComplete]);

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

  if (!activeExercise) {
    return null;
  }

  const secondsHeld = Math.floor(holdCount / 30);
  const totalSeconds = activeExercise.holdSeconds;
  const progress = (secondsHeld / totalSeconds) * 100;

  return (
    <>
      <div className="exercise-overlay" onClick={() => setActiveExercise(null)} />
      <div className="exercise-coach">
        <div className="exercise-title">{activeExercise.name}</div>
        <div className="exercise-instruction">{activeExercise.instruction}</div>

        <div className="exercise-timer">
          {secondsHeld}/{totalSeconds}s
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '8px', textAlign: 'center' }}>
            Hold Progress
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: isFormValid ? '#22c55e' : '#eab308',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        <div className={`exercise-feedback ${isFormValid ? 'correct' : 'warning'}`}>
          {feedback}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: '#b0b0b0' }}>
          {secondsHeld >= totalSeconds ? 'Complete' : `Keep form steady for ${totalSeconds - secondsHeld}s`}
        </div>
      </div>
    </>
  );
};

export default ExerciseCoach;
